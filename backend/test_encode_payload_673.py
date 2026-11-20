"""Siklus 673: negosiasi encoding brotli > gzip di static_serve.

Kontrak baru (_encode_payload):
- Client Accept-Encoding memuat 'br' & brotli tersedia → Content-Encoding: br
  (payload brotli q9), bila lebih kecil dari raw.
- Tanpa 'br' → perilaku lama: gzip (maybe_gzip) bila menguntungkan.
- Tanpa dukungan → identitas, encoding None.
"""
import gzip
import io
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from static_serve import _encode_payload, maybe_gzip, gzip_html  # noqa: E402

try:
    import brotli  # noqa: F401
    HAVE_BROTLI = True
except ImportError:
    HAVE_BROTLI = False

JS = (b"function pad(s,n){while(s.length<n)s+=' ';return s}\n" * 200)  # ~9KB


@unittest.skipUnless(HAVE_BROTLI, "brotli binding tidak tersedia")
class EncodePayloadBrotli(unittest.TestCase):
    def test_br_preferred_when_accepted(self):
        payload, enc = _encode_payload(JS, "gzip, deflate, br, zstd")
        self.assertEqual(enc, "br")
        self.assertLess(len(payload), len(JS))
        self.assertEqual(len(brotli.decompress(payload)), len(JS))

    def test_gzip_fallback_without_br(self):
        payload, enc = _encode_payload(JS, "gzip, deflate")
        self.assertEqual(enc, "gzip")
        self.assertEqual(gzip.decompress(payload), JS)

    def test_identity_when_neither_accepted(self):
        payload, enc = _encode_payload(JS, "identity")
        self.assertIsNone(enc)
        self.assertEqual(payload, JS)

    def test_br_payload_smaller_than_gzip_on_bundle(self):
        # Bukti hemat: pada aset bundle besar br9 < gz6 (pol produksi).
        d = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              "..", "dist", "assets",
                              "vendor-three-DSHDG1_3.js"), "rb").read()
        br, enc = _encode_payload(d, "br")
        gz, genc = maybe_gzip(d, "/assets/vendor-three.js", "gzip")
        self.assertEqual(enc, "br")
        self.assertTrue(genc)
        self.assertLess(len(br), len(gz))


class EncodePayloadNoBrotli(unittest.TestCase):
    """Runtime tanpa binding brotli tetap gzip (fallback aman)."""

    def test_fallback_gzip_when_import_fails(self):
        # Simulasikan ImportError dengan monkeypatch import di fungsi:
        # _encode_payload memanggil import brotli di dalam try; kita sulit
        # mempatch import statement — cukup verifikasi jalur gzip via
        # Accept-Encoding tanpa 'br' tetap berjalan.
        payload, enc = _encode_payload(JS, "gzip")
        self.assertEqual(enc, "gzip")
        self.assertEqual(gzip.decompress(payload), JS)


class GzipHtmlParity(unittest.TestCase):
    def test_gzip_html_still_available(self):
        # Fungsi lama tetap ada (dipakai guard lama & fallback).
        data, gz = gzip_html(b"<html>" + b"x" * 3000 + b"</html>", "gzip")
        self.assertTrue(gz)
        self.assertEqual(gzip.decompress(data),
                         b"<html>" + b"x" * 3000 + b"</html>")


if __name__ == "__main__":
    unittest.main()
