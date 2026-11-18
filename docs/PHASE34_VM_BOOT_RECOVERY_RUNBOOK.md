# Phase 34 — disposable VM boot recovery runbook

Use a disposable x86_64 Linux CI host with `qemu-system-x86`,
`qemu-utils`, `cloud-image-utils`, Python 3 and outbound access to
the pinned [Ubuntu Noble image](https://cloud-images.ubuntu.com/noble/20260911/SHA256SUMS)
and Ubuntu package repositories. With the repo checked out, run:

```sh
python scripts/ci_phase34_reboot_vm.py
```

The harness verifies the guest image SHA-256 before booting and
passes code and systemd configuration on a local NoCloud seed disk.
The guest package manager verifies repository signatures. There are no
host mounts, guest port forwards, inherited host Docker socket, or
production credentials. TCG needs no hardware virtualization device.
The fixture uses real guest Docker, a small local BusyBox rootfs, and
non-restarting, network-disabled containers. Checks use the production
lease and registry reader with a narrow test adapter and a synthetic
registry. The real signed two-tenant path stays in its existing job step.

Boot one enables the recovery-only unit and requests a guest reboot.
Boot two proves a different kernel boot ID and live wall-clock deadline,
then denies the lease before state changes. Recovery must suspend the
old lease and not promote, replace, or start containers. A second call
must be a no-op. The guest shuts itself down on success. CI uploads
`phase34-reboot-proof.json` only after both boot markers validate and
QEMU exits cleanly. A bounded serial tail is available on guest failures.

On failure, inspect the serial log for cloud-init, Docker, or systemd
errors. Do not make the assertion pass by shortening the registry
deadline, starting the preview on boot, or deleting Docker volumes.
Use a fresh VM disk for retry. The named volume sentinel demonstrates
retention only. Run database recovery with a separately approved
durable PostgreSQL fixture and test crash, WAL recovery, and cleanup
authorization independently.
