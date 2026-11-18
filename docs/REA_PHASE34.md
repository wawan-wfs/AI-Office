# WFS AI Office — Phase 34 Linux VM boot recovery

Baseline `d1d404f52e6fce5266d794be6aeb7c26bce09ae1` passed
[13/13 CI jobs](https://github.com/wawanwfs/AI-Office/actions/runs/44332100023).
Phase 33 accepted 59 of 65 scoped gates.

## Gate 66 — Reject a persisted lease from a previous Linux boot

- Boot and reboot a pinned Ubuntu cloud image under QEMU in the existing
  Linux operator job. Run an enabled systemd recovery-only unit on boot
  two. Never reboot the CI host.
- In the guest, run actual Docker containers before reboot with restart
  disabled. Use the real SQLite registry reader and worker recovery
  function with a fixture registry and a future deadline. Establish
  that the second boot rejects the lease before the recovery worker
  changes the registry. Require a scoped container stop, terminal
  suspension, and an idempotent repeat.
- Compare container and image inventories across boot, allow only
  scoped list and stop commands during recovery, and retain a sentinel
  on the Docker named volume. No signed release check or preview
  promotion may occur. The named volume sentinel is not PostgreSQL
  crash recovery.
- The existing Phase 28–33 checks remain separate, including rootless
  BuildKit, independent OCI verification, two-tenant signed HTTP,
  and Windows-native offline fail-closed behavior.

The gate is accepted only after `phase34-reboot-proof.json` and all
13 jobs pass on the exact branch, PR and merged main. When accepted,
the scoped matrix is **60/66 (90.9%)**. The VM does not establish
independently administered custody, Docker Desktop/WSL2, durable
PostgreSQL recovery, or production readiness.
