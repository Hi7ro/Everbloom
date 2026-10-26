#!/usr/bin/env python3
"""Loopback-only production bundle/CSP smoke server. Not a deployment server."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import argparse
import http.client
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
assets = root / 'frontend/dist/everbloom/browser'
csp = re.search(r'Content-Security-Policy "([^"]+)"', (root / 'deploy/Caddyfile').read_text()).group(1)

class Preview(SimpleHTTPRequestHandler):
    backend_port = 8080
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(assets), **kwargs)
    def log_message(self, *_):
        pass  # Account URLs, cookies and token fragments are never logged.
    def end_headers(self):
        self.send_header('Content-Security-Policy', csp)
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def do_GET(self):
        if self.path.startswith('/api/'):
            return self.api()
        if not Path(self.translate_path(self.path)).is_file():
            self.path = '/index.html'
        super().do_GET()
    def do_POST(self):
        self.api()
    def do_PUT(self):
        self.api()
    def api(self):
        if not self.path.startswith('/api/'):
            return self.send_error(404)
        length = int(self.headers.get('Content-Length', '0'))
        if length > 32768:
            return self.send_error(413)
        headers = {key: value for key, value in self.headers.items() if key.lower() in ('cookie', 'content-type', 'accept', 'x-csrf-token', 'x-everbloom-account')}
        connection = http.client.HTTPConnection('127.0.0.1', self.backend_port, timeout=25)
        try:
            connection.request(self.command, self.path, self.rfile.read(length) if length else None, headers)
            response = connection.getresponse()
            data = response.read()
            self.send_response(response.status)
            for key, value in response.getheaders():
                if key.lower() not in ('connection', 'transfer-encoding', 'content-length', 'cache-control'):
                    self.send_header(key, value)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except (OSError, http.client.HTTPException):
            self.send_error(502, 'Local backend unavailable')
        finally:
            connection.close()

def main():
    def port(value):
        try:
            number = int(value)
        except ValueError:
            raise argparse.ArgumentTypeError('Port must be a number from 1 to 65535.') from None
        if not 1 <= number <= 65535:
            raise argparse.ArgumentTypeError('Port must be a number from 1 to 65535.')
        return number

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=port, default=4203)
    parser.add_argument('--backend-port', type=port, default=8080)
    args = parser.parse_args()
    Preview.backend_port = args.backend_port
    if not (assets / 'index.html').is_file():
        raise SystemExit('Run the frontend production build first.')
    print(f'Herovera production preview: http://127.0.0.1:{args.port} (CSP from deploy/Caddyfile)', flush=True)
    with ThreadingHTTPServer(('127.0.0.1', args.port), Preview) as server:
        server.serve_forever()


if __name__ == '__main__':
    main()
