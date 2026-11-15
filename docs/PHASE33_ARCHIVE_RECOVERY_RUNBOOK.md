# WFS AI Office — Phase 33 archive catch-up

Take the operator out of service before recovery. Preserve the operator
anchor file if it exists. Gather complete signed archive windows in
chronological order and independently verify the final archive sequence
and SHA-256. These are the last signed checkpoint's sequence and exact
byte hash, not the hash of the archive JSON or the signer fingerprint.
The target should be the boundary retained by the live generation.

```bash
python scripts/wfs_recover_release_journal.py \
  --state /operator-custody/release-head.json \
  --archive /archives/journal-1-64.json \
  --archive /archives/journal-64-127.json \
  --policy-key /operator-trust/policy.pem \
  --policy-fingerprint "$WFS_POLICY_FINGERPRINT" \
  --target-sequence 127 --target-sha256 "$WFS_BOUNDARY_SHA256"
```

The first window must contain the existing durable sequence and hash.
Later windows must start at the prior window's exact tip. At most 16
complete windows are processed per invocation. The command writes once
using the existing durable anchor lock after all checks pass. Missing
custody is not recreated. Archive handling supplies no WORM storage
or independent trust of its own.

Offline success reports `release_authorized: false`. Restart the
operator with the independently provisioned external target pin and
the original signer fingerprint, then let the existing mTLS path
check the live tip. Rotation alone never unrevokes or extends an
expired approval. Do not use this command to create initial custody
or restore a deleted trust root.

Inspect `phase33_journal_archive_recovery` in the Docker CI artifact.
The runner uses synthetic keys and one administrative domain.
