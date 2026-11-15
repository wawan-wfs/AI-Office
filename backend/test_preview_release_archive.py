"""Offline archive recovery is pinned, bounded, and not authorization."""
import json
from pathlib import Path
import subprocess
import sys

import pytest

from preview_admission_v2 import AdmissionDenied
from preview_release_archive import MAX_ARCHIVES, recover_archived_anchor
from test_preview_release_journal import journal


@pytest.fixture
def recovery(tmp_path, journal):
    custody = tmp_path / "custody"
    custody.mkdir(mode=0o700)
    journal.append()
    state = custody / "head.json"
    state.write_text(json.dumps({"version": 1, "key_fingerprint": journal.fingerprint,
                                 "sequence": 1, "sha256": journal.hashes[0]}))
    state.chmod(0o600)
    paths = []
    for generation in range(2):
        while len(journal.entries) < 64:
            journal.append()
        path = tmp_path / f"window-{generation}.json"
        path.write_bytes(journal.journal.read_bytes())
        paths.append(path)
        journal.rotate()
    return dict(state_path=state, archives=paths, key_path=journal.policy_key,
                fingerprint=journal.fingerprint, target_sequence=127,
                target_sha256=journal.hashes[126])


def test_recover_cli_advances_without_authorizing_or_replacing_archives(recovery):
    state, archives = recovery["state_path"], recovery["archives"]
    original = [path.read_bytes() for path in archives]
    cli = Path(__file__).resolve().parents[1] / "scripts/wfs_recover_release_journal.py"
    result = subprocess.run([sys.executable, str(cli), "--state", str(state),
                             "--archive", str(archives[0]), "--archive", str(archives[1]),
                             "--policy-key", str(recovery["key_path"]),
                             "--policy-fingerprint", recovery["fingerprint"],
                             "--target-sequence", "127", "--target-sha256",
                             recovery["target_sha256"]], capture_output=True, text=True,
                            check=True, timeout=10)
    assert json.loads(result.stdout) == {
        "sequence": 127, "sha256": recovery["target_sha256"],
        "archives_verified": 2, "release_authorized": False}
    assert json.loads(state.read_text())["sequence"] == 127
    assert [path.read_bytes() for path in archives] == original


@pytest.mark.parametrize("case,reason", [
    ("reverse", "continuity"), ("gap", "continuity"),
    ("repeat", "continuity"), ("bad-target", "pinned target"),
    ("bad-signature", "signature"), ("partial", "full journal windows"),
    ("too-many", "bounded archives"), ("lost-state", "anchor unavailable"),
])
def test_recovery_denials_do_not_advance_or_recreate_state(recovery, case, reason):
    state = recovery["state_path"]
    old = state.read_bytes()
    first, second = recovery["archives"]
    if case == "lost-state":
        state.unlink()
    elif case == "bad-target":
        recovery["target_sha256"] = "0" * 64
    elif case == "reverse":
        recovery["archives"] = [second, first]
    elif case == "gap":
        recovery["archives"] = [second]
    elif case == "repeat":
        recovery["archives"] = [first, first]
    elif case == "too-many":
        recovery["archives"] = [first] * (MAX_ARCHIVES + 1)
    else:
        doc = json.loads(first.read_bytes())
        if case == "bad-signature":
            signature = doc["entries"][-1]["signature"]
            doc["entries"][-1]["signature"] = ("B" if signature[0] == "A" else "A") + signature[1:]
        else:
            doc["entries"].pop()
        first.write_text(json.dumps(doc))
    with pytest.raises(AdmissionDenied, match=reason):
        recover_archived_anchor(**recovery)
    if case == "lost-state":
        assert not state.exists()
    else:
        assert state.read_bytes() == old


def test_validly_signed_alternate_window_cannot_bridge_existing_archive(recovery, journal):
    # Same signer and same genesis, but a different decision in the second
    # generation produces a different signed tip and cannot splice to it.
    first, second = recovery["archives"]
    old = recovery["state_path"].read_bytes()
    second_doc = json.loads(second.read_bytes())
    boundary = second_doc["entries"][0]
    journal.entries = [boundary, second_doc["entries"][1]]
    journal.hashes = journal.hashes[:65]
    journal.append("revoke")
    while len(journal.entries) < 64:
        journal.append()
    # The third window is not needed to detect the signed alternate tip:
    # the operator pins the independently verified, different original hash.
    second.write_bytes(journal.journal.read_bytes())
    with pytest.raises(AdmissionDenied, match="pinned target"):
        recover_archived_anchor(**recovery)
    assert first.exists() and recovery["state_path"].read_bytes() == old
