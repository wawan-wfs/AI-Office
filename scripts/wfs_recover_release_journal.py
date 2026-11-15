#!/usr/bin/env python3
"""Advance an existing operator anchor using complete, signed offline archives."""
import argparse
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from preview_release_archive import recover_archived_anchor


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", required=True)
    parser.add_argument("--archive", action="append", required=True)
    parser.add_argument("--policy-key", required=True)
    parser.add_argument("--policy-fingerprint", required=True)
    parser.add_argument("--target-sequence", type=int, required=True)
    parser.add_argument("--target-sha256", required=True)
    args = parser.parse_args()
    try:
        result = recover_archived_anchor(
            state_path=args.state, archives=args.archive, key_path=args.policy_key,
            fingerprint=args.policy_fingerprint, target_sequence=args.target_sequence,
            target_sha256=args.target_sha256)
    except (OSError, ValueError) as exc:
        parser.exit(1, f"Archive recovery denied: {exc}\n")
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
