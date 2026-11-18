"""Boot and reboot a pinned Linux guest. Never reboot or mount the host."""
import base64
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tarfile
import tempfile
import uuid

ROOT = Path(__file__).resolve().parents[1]
STATE = "/var/lib/wfs-phase34"
IMAGE_URL = ("https://cloud-images.ubuntu.com/noble/20260911/"
             "noble-server-cloudimg-amd64.img")
IMAGE_SHA256 = "612b2c0cc1bc413a6cb8c38fd611794caf0f2b436c50013d8b3794db12ad7354"
UNIT = "wfs-phase34-recover.service"
RECOVERY_UNIT = f"""[Unit]
Description=WFS disposable Phase 34 recovery-only acceptance
Requires=docker.service
After=docker.service cloud-final.service
ConditionPathExists={STATE}/seed.json

[Service]
Type=oneshot
Environment=PYTHONPATH={STATE}/backend
ExecStart=/usr/bin/python3 {STATE}/ci_phase34_boot_guest.py recover
StandardOutput=tty
StandardError=tty
TTYPath=/dev/ttyS0
TimeoutStartSec=180
UMask=0077
PrivateNetwork=yes

[Install]
WantedBy=multi-user.target
"""
DOCKER_RECOVERY = f"""#!/bin/sh
set -eu
case "${{1-}}:${{2-}}" in
  container:ls|container:stop) ;;
  *) exit 97 ;;
esac
printf '%s\\n' "$*" >> {STATE}/docker-recovery.log
exec /usr/bin/docker "$@"
"""
SETUP = f"""#!/bin/sh
set -eu
tar -xzf {STATE}/source.tar.gz -C {STATE}
systemctl enable --now docker.service
PYTHONPATH={STATE}/backend /usr/bin/python3 {STATE}/ci_phase34_boot_guest.py seed >/dev/ttyS0 2>&1
"""


def seed_config(guest_dir):
    bundle = io.BytesIO()
    with tarfile.open(fileobj=bundle, mode="w:gz") as tar:
        for path in sorted((ROOT / "backend").glob("*.py")):
            if not path.name.startswith("test_"):
                tar.add(path, arcname=f"backend/{path.name}")
        tar.add(ROOT / "scripts/ci_phase34_boot_guest.py", arcname="ci_phase34_boot_guest.py")
    user_data = [
        "#cloud-config", "ssh_pwauth: false", "disable_root: true", "users: []",
        "package_update: true",
        'packages: ["docker.io", "busybox-static", "python3-cryptography", "python3-httpx"]',
        "write_files:",
    ]
    for path, mode, content in [
        (f"{STATE}/source.tar.gz", "0600", bundle.getvalue()),
        (f"{STATE}/docker-recovery", "0700", DOCKER_RECOVERY.encode()),
        (f"{STATE}/setup", "0700", SETUP.encode()),
        (f"/etc/systemd/system/{UNIT}", "0644", RECOVERY_UNIT.encode()),
    ]:
        user_data.extend([f"  - path: {path}", f"    permissions: '{mode}'",
                          "    encoding: b64", "    content: " + base64.b64encode(content).decode()])
    user_data.append(f'runcmd: [["{STATE}/setup"]]')
    (guest_dir / "user-data").write_text("\n".join(user_data) + "\n")
    (guest_dir / "meta-data").write_text("instance-id: wfs-phase34-vm\nlocal-hostname: wfs-phase34-vm\n")
    subprocess.run(["cloud-localds", "seed.img", "user-data", "meta-data"],
                   cwd=guest_dir, timeout=25, check=True)


def read_result(console):
    records = []
    for line in console.splitlines():
        match = re.search(r"WFS_PHASE34_(BOOT[12]) (\{[^\n]*\})\s*$", line)
        if match:
            records.append((match[1], json.loads(match[2])))
    assert [stage for stage, _ in records] == ["BOOT1", "BOOT2"], "expected exactly two ordered boot records"
    first, second = (value for _, value in records)
    assert str(uuid.UUID(first["boot_id"])) == first["boot_id"]
    assert str(uuid.UUID(second["boot_id"])) == second["boot_id"]
    assert first["boot_id"] != second["boot_id"] and first["boot_id"] == second["prior_boot_id"]
    assert first["original_containers_running"] is True and first["registry_admitted"] is True
    assert second["prior_deadline_seconds_remaining"] > 0 and second["recovery_unit"] == UNIT
    assert second["automatic_promotion"] is False
    for key in ("registry_denied_before_recovery", "old_lease_suspended",
                "original_container_ids_preserved", "named_volume_sentinel_preserved",
                "repeat_recovery_idempotent"):
        assert second[key] is True
    return {"boot1": first, "boot2": second, "vm_image_sha256": IMAGE_SHA256,
            "host_reboot_exercised": False, "durable_postgresql_recovery_exercised": False,
            "checkout_sha": os.environ.get("GITHUB_SHA")}


def main():
    output = ROOT / "artifacts/phase6-preview-manager"
    output.mkdir(parents=True, exist_ok=True)
    proof = output / "phase34-reboot-proof.json"
    proof.unlink(missing_ok=True)
    with tempfile.TemporaryDirectory(prefix="wfs-phase34-vm-") as temp:
        guest = Path(temp)
        subprocess.run(["curl", "--fail", "--silent", "--show-error", "--location",
                        "--retry", "2", "--max-time", "100", IMAGE_URL, "-o", "guest.img"],
                       cwd=guest, timeout=330, check=True)
        subprocess.run(["sha256sum", "--check", "--strict"], cwd=guest, check=True, timeout=25,
                       input=f"{IMAGE_SHA256}  guest.img\n", text=True)
        subprocess.run(["qemu-img", "resize", "-f", "qcow2", "guest.img", "10G"],
                       cwd=guest, timeout=25, check=True)
        seed_config(guest)
        console = guest / "serial.log"
        try:
            subprocess.run([
                "qemu-system-x86_64", "-accel", "tcg,thread=multi", "-cpu", "max", "-smp", "2",
                "-m", "2560", "-display", "none", "-monitor", "none", "-serial", "file:serial.log",
                "-drive", "file=guest.img,format=qcow2,if=virtio",
                "-drive", "file=seed.img,format=raw,if=virtio,readonly=on",
                "-nic", "user,model=virtio-net-pci",
            ], cwd=guest, check=True, timeout=960)
            record = read_result(console.read_text(errors="replace"))
        except (OSError, subprocess.SubprocessError, AssertionError, ValueError, KeyError):
            if console.is_file():
                with console.open("rb") as log:
                    log.seek(max(0, console.stat().st_size - 48000))
                    (output / "phase34-reboot-failure.log").write_bytes(log.read())
                print((output / "phase34-reboot-failure.log").read_text(errors="replace"))
            raise
        proof.write_text(json.dumps(record, indent=2, sort_keys=True) + "\n")
        print(proof.read_text(), end="")


if __name__ == "__main__":
    main()
