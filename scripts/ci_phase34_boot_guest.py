"""Phase 34 fixture executed by PID 1's services in a disposable QEMU guest."""
from contextlib import closing
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import tarfile
import time

from preview_boot_identity import current_boot_id
from preview_manager import TemplatePreviewManager
from preview_proxy import PreviewProxyUnavailable, PreviewRegistryReader
from preview_release_journal import JournalTLS, RemoteReleasePolicy
from preview_release_lease import recover_preview_supervision

STATE = Path("/var/lib/wfs-phase34")
PROJECT = "boot-fixture"
PORT = 19834
UNIT = "wfs-phase34-recover.service"
VOLUME = "wfs-phase34-retain"
IMAGE = "wfs-phase34-busybox:ci"
SENTINEL = "phase34-volume-survived\n"


def command(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True, timeout=45).stdout.strip()


def docker(*args):
    return command("/usr/bin/docker", *args)


def assert_guest():
    assert STATE.is_dir() and os.geteuid() == 0
    assert Path("/proc/1/comm").read_text().strip() == "systemd"
    assert command("systemd-detect-virt", "--vm") == "qemu"


def emit(stage, **fields):
    print("WFS_PHASE34_" + stage + " " + json.dumps(fields, sort_keys=True), flush=True)


class RecoveryFixture:
    # The negative boot gate does not need any valid release material. Any
    # attempt to check a release is evidence that recovery crossed its boundary.
    sealed_runtime = True
    oci_release = object()
    registry = STATE / "registry.db"
    docker = str(STATE / "docker-recovery")
    _compose_name = staticmethod(TemplatePreviewManager._compose_name)
    _db = TemplatePreviewManager._db

    def __init__(self):
        absent = STATE / "not-provisioned"
        self.release_policy = RemoteReleasePolicy(
            JournalTLS("https://127.0.0.1", absent, absent, absent, "a" * 64),
            absent, "a" * 64, 1, "b" * 64, custody_path=STATE / "unused-anchor")

    def _verify(self):
        (STATE / "unexpected-release-check").touch()
        raise AssertionError("stale boot entered release verification")

    def status(self, project):
        with closing(self._db()) as db:
            return dict(db.execute("SELECT * FROM wfs_preview_instances WHERE project_id=?",
                                   (project,)).fetchone())


def volume_probe():
    mount = Path(docker("volume", "inspect", "--format", "{{.Mountpoint}}", VOLUME))
    return mount / "probe.txt"


def running(container):
    return docker("inspect", "--format", "{{.State.Running}}", container) == "true"


def assert_denied(reader):
    try:
        reader.port(PROJECT)
    except PreviewProxyUnavailable:
        return
    raise AssertionError("registry admitted the old boot lease")


def seed():
    manager = RecoveryFixture()
    compose = manager._compose_name(PROJECT)
    boot = current_boot_id()
    assert boot and not manager.registry.exists()
    # Import a minimal locally installed binary. Nothing is pulled in the guest.
    archive = STATE / "rootfs.tar"
    with tarfile.open(archive, "w") as tar:
        tar.add(Path("/usr/bin/busybox").resolve(), arcname="bin/busybox")
    image = docker("image", "import", str(archive), IMAGE)
    docker("volume", "create", VOLUME)
    ids = {}
    for service in ("api", "ingress", "db"):
        extra = ("--mount", f"type=volume,source={VOLUME},target=/data") if service == "db" else ()
        ids[service] = docker("run", "--detach", "--restart=no", "--network=none", *extra,
                              "--label", f"com.docker.compose.project={compose}",
                              "--label", f"com.docker.compose.service={service}",
                              IMAGE, "/bin/busybox", "sleep", "3600")
        assert running(ids[service])
    volume_probe().write_text(SENTINEL)
    # Use an intentionally future deadline to distinguish boot denial from
    # elapsed-wall-time denial. This is a fixture, not a renewed 15s lease.
    deadline = time.time() + 600
    with closing(manager._db()) as db:
        db.execute("""CREATE TABLE wfs_preview_instances(
            project_id TEXT PRIMARY KEY, compose_name TEXT, port INTEGER, phase TEXT,
            api_container_id TEXT, oci_approval_sha256 TEXT,
            lease_deadline REAL, lease_boot_id TEXT, lease_suspended INTEGER)""")
        db.execute("INSERT INTO wfs_preview_instances VALUES (?, ?, ?, 'running', ?, ?, ?, ?, 0)",
                   (PROJECT, compose, PORT, ids["api"], "c" * 64, deadline, boot))
    assert PreviewRegistryReader(manager.registry).port(PROJECT) == PORT
    (STATE / "seed.json").write_text(json.dumps(dict(boot=boot, ids=ids, image=image)))
    command("systemctl", "enable", UNIT)
    emit("BOOT1", boot_id=boot, original_containers_running=True, registry_admitted=True)
    command("systemctl", "--no-block", "reboot")


def recover():
    manager = RecoveryFixture()
    original = json.loads((STATE / "seed.json").read_text())
    old = manager.status(PROJECT)
    boot = current_boot_id()
    assert boot and boot != original["boot"] == old["lease_boot_id"]
    assert old["phase"] == "running" and old["lease_suspended"] == 0
    seconds_remaining = old["lease_deadline"] - time.time()
    assert seconds_remaining > 0
    reader = PreviewRegistryReader(manager.registry)
    assert_denied(reader)  # At this point the supervisor hasn't written a byte.
    assert manager.status(PROJECT) == old

    ids = original["ids"]
    assert not any(running(i) for i in ids.values())
    workers = []
    after = recover_preview_supervision(manager, PROJECT, on_worker=workers.append)
    assert len(workers) == 1 and workers[0] > 1
    assert after == dict(old, phase="stopped", lease_deadline=0, lease_suspended=1)
    assert_denied(reader)
    assert not (STATE / "unexpected-release-check").exists()
    assert not (STATE / "unused-anchor").exists()

    # Verify the recovery invoked exactly read/list, scoped stop, read/list.
    trace = [line.split() for line in (STATE / "docker-recovery.log").read_text().splitlines()]
    list_cmd = ["container", "ls"]
    filters = ["--no-trunc", "--quiet", "--filter",
               f"label=com.docker.compose.project={old['compose_name']}", "--filter"]
    assert trace == [
        list_cmd + ["--all"] + filters + ["label=com.docker.compose.service=ingress"],
        list_cmd + ["--all"] + filters + ["label=com.docker.compose.service=api"],
        ["container", "stop", "--time", "3", ids["ingress"], ids["api"]],
        list_cmd + filters + ["label=com.docker.compose.service=ingress"],
        list_cmd + filters + ["label=com.docker.compose.service=api"],
    ]
    assert set(docker("container", "ls", "-aq", "--no-trunc").splitlines()) == set(ids.values())
    assert not any(running(i) for i in ids.values())
    for container in ids.values():
        assert docker("inspect", "--format", "{{.HostConfig.RestartPolicy.Name}}", container) == "no"
    assert docker("image", "ls", "-aq", "--no-trunc") == original["image"]
    assert volume_probe().read_text() == SENTINEL
    assert recover_preview_supervision(manager, PROJECT) == after
    assert len((STATE / "docker-recovery.log").read_text().splitlines()) == len(trace)
    emit("BOOT2", boot_id=boot, prior_boot_id=original["boot"],
         prior_deadline_seconds_remaining=round(seconds_remaining, 3),
         registry_denied_before_recovery=True, recovery_unit=UNIT,
         old_lease_suspended=True, automatic_promotion=False,
         original_container_ids_preserved=True, named_volume_sentinel_preserved=True,
         repeat_recovery_idempotent=True)
    command("systemctl", "--no-block", "poweroff")


if __name__ == "__main__":
    assert_guest()
    if len(sys.argv) != 2 or sys.argv[1] not in ("seed", "recover"):
        raise SystemExit("expected one fixture stage")
    (seed if sys.argv[1] == "seed" else recover)()
