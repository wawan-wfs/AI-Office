"""Offline catch-up for an existing release-journal high-water anchor."""
from preview_admission_v2 import AdmissionDenied
from preview_oci_layout import is_sha256, json_object
from preview_release_anchor import DurableReleaseAnchor
from preview_release_journal import MAX_BODY, MAX_RECORDS, contains_anchor, journal_index, verify_journal
from preview_release_policy import _MAX_SEQUENCE
from preview_signature import _read_trusted

MAX_ARCHIVES = 16


def recover_archived_anchor(*, state_path, archives, key_path, fingerprint,
                            target_sequence, target_sha256):
    """Advance only to an independently pinned archive tip, never authorize a release."""
    if (not isinstance(archives, (list, tuple)) or not 1 <= len(archives) <= MAX_ARCHIVES
            or not is_sha256(fingerprint) or not is_sha256(target_sha256)
            or type(target_sequence) is not int or not 1 <= target_sequence <= _MAX_SEQUENCE):
        raise AdmissionDenied("bounded archives and independent target pins required")
    public = _read_trusted(key_path, 4096)
    custody = DurableReleaseAnchor(state_path, _MAX_SEQUENCE)
    with custody.locked(fingerprint) as (stored, commit):
        # Validate the entire chain before writing. The first window must
        # contain the existing durable sequence AND hash.
        cursor = stored
        for offset, path in enumerate(archives):
            document = json_object(_read_trusted(path, MAX_BODY))
            if set(document) != {"entries"}:
                raise AdmissionDenied("invalid archived journal document")
            chain = verify_journal(document["entries"], public, fingerprint)
            if len(chain) != MAX_RECORDS:
                raise AdmissionDenied("archive recovery requires full journal windows")
            index = journal_index(chain)
            if not contains_anchor(index, *cursor) or (offset and min(index) != cursor[0]):
                raise AdmissionDenied("archive recovery continuity or fork check failed")
            digest, policy = chain[-1]
            tip = policy["sequence"], digest
            if tip[0] < cursor[0] or (offset and tip[0] == cursor[0]):
                raise AdmissionDenied("archive recovery cannot roll back or repeat windows")
            cursor = tip
        if cursor != (target_sequence, target_sha256):
            raise AdmissionDenied("archive tip differs from independently pinned target")
        commit(*cursor)
        return {"sequence": cursor[0], "sha256": cursor[1],
                "archives_verified": len(archives), "release_authorized": False}
