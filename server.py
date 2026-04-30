import http.server
import mimetypes

mimetypes.add_type('application/javascript', '.mjs')
mimetypes.add_type('application/javascript', '.js')

class Handler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        mime, _ = mimetypes.guess_type(path)
        return mime or 'application/octet-stream'

if __name__ == '__main__':
    http.server.test(HandlerClass=Handler, port=5500)
