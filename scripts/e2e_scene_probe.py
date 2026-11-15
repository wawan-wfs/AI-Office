"""Tangkap exception & console error saat scene dimuat (WebGL SwiftShader, headless).
Pakai: uv run --with websocket-client python scripts/e2e_scene_probe.py [url]
Output 'Scene init failed' = scene jatuh ke mode UI-only (biasanya ReferenceError dari deklarasi yang hilang).
Peringatan deprecasi THREE.Clock/PCFSoftShadowMap normal.

Siklus 560: dipindah ke repo (dulu di cache scratch /tmp, mudah ter-prune).
WS memakai kelas WS ter-deadline (pola shot.py siklus 197): connect + handshake
bawa timeout WS_TIMEOUT_S dan EOF guard — chrome mati di tengah handshake tidak
lagi membuat probe hang tanpa batas; urlopen daftar tab juga bawa timeout."""
import subprocess, time, json, os, sys, socket, struct, base64, urllib.request

WS_TIMEOUT_S = 60  # siklus 197: tanpa timeout koneksi bisa menggantung tanpa batas


class WS:
    def __init__(s, u):
        from urllib.parse import urlparse
        pr = urlparse(u)
        s.sock = socket.create_connection((pr.hostname, pr.port), timeout=WS_TIMEOUT_S)
        s.sock.sendall((f"GET {pr.path} HTTP/1.1\r\nHost: {pr.hostname}:{pr.port}\r\n"
                        "Upgrade: websocket\r\nConnection: Upgrade\r\n"
                        f"Sec-WebSocket-Key: {base64.b64encode(os.urandom(16)).decode()}\r\n"
                        "Sec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        s.sock.settimeout(WS_TIMEOUT_S)  # d1: handshake tanpa deadline = hang selamanya
        while b"\r\n\r\n" not in buf:
            c = s.sock.recv(1)
            if not c:  # chrome mati di tengah handshake -> EOF, dulu loop selamanya
                raise ConnectionResetError("EOF saat handshake WS")
            buf += c

    def send(s, m):
        d = m.encode(); h = b"\x81"; n = len(d); mask = os.urandom(4)
        if n < 126: h += bytes([0x80 | n])
        else: h += bytes([0x80 | 126]) + struct.pack(">H", n)
        s.sock.sendall(h + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(d)))

    def recv_text(s):
        def rx(n):
            b = b""
            while len(b) < n:
                c = s.sock.recv(n - len(b))
                if not c: raise ConnectionError("ws closed")
                b += c
            return b

        def frame():
            hdr = rx(2); op = hdr[0] & 0xf; n = hdr[1] & 0x7f
            if n == 126: n = struct.unpack(">H", rx(2))[0]
            elif n == 127: n = struct.unpack(">Q", rx(8))[0]
            return op, rx(n)

        op, d = frame()
        while op == 0:  # continuation frame
            op, d2 = frame(); d += d2
            if op != 0: break
        return d.decode("utf-8", "replace")


URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:9503/?e2e=1'
C = os.path.expanduser('~/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome')
port = 9337
p = subprocess.Popen([C, '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
                      '--use-gl=angle', '--ignore-gpu-blocklist', '--remote-allow-origins=*',
                      f'--remote-debugging-port={port}', '--window-size=1366,768', 'about:blank'],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=dict(os.environ, DISPLAY=':99'))
time.sleep(4)
tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json', timeout=10))
ws = WS([t for t in tabs if t['type'] == 'page'][0]['webSocketDebuggerUrl'])
n = 0
def send(m, **k):
    global n; n += 1
    ws.send(json.dumps({'id': n, 'method': m, 'params': k}))
send('Runtime.enable'); send('Log.enable'); send('Page.enable')
send('Page.navigate', url=URL)
end = time.time() + 14
while time.time() < end:
    try:
        ws.sock.settimeout(2); r = json.loads(ws.recv_text())
    except (socket.timeout, ConnectionError):
        continue
    m = r.get('method', '')
    if m == 'Runtime.exceptionThrown':
        d = r['params']['exceptionDetails']
        print('EXC', d.get('text'), (d.get('exception') or {}).get('description', '')[:300])
    elif m == 'Runtime.consoleAPICalled' and r['params']['type'] in ('error', 'warning'):
        print('CON', [a.get('value') or a.get('description') for a in r['params']['args']][:2])
p.terminate()
