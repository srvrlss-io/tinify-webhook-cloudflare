from http.server import BaseHTTPRequestHandler, HTTPServer
import logging

class RequestHandler(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)  # Read POST data
        try:
            logging.info("POST request received:\nHeaders:\n%s\n\nBody:\n%s\n",
                         str(self.headers), post_data.decode('utf-8'))
        except Exception:
            logging.info("POST request received:\nHeaders:\n%s\n\n",
                         str(self.headers))
            with open('testimage.png', 'wb') as f:
                f.write(post_data)

        self._set_response()
        self.wfile.write("POST request received!".encode('utf-8'))  # Send response

def run(server_class=HTTPServer, handler_class=RequestHandler, port=5000):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting HTTP server...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping server...\n')

if __name__ == '__main__':
    run()

