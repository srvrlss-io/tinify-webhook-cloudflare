# Tinify Webhook Cloudflare Worker

Tinify Webhook Proxy: A Cloudflare Worker that acts as a flexible proxy for Tinify image compression API. Supports various input methods including form data, headers, and direct payload. Ideal for serverless image optimization workflows.

## Installation

To install and deploy the Tinify Webhook Cloudflare Worker, follow these steps:

1. Ensure you have a Cloudflare account and have set up Wrangler CLI. If not, follow the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/get-started/guide) to get started.

2. Clone this repository:
   ```
   git clone git@github.com:srvrlss-io/tinify-webhook-cloudflare.git
   cd tinify-webhook-cloudflare
   ```

3. Configure your `wrangler.toml` file with your account details and worker name.

4. Deploy the worker:
   ```
   wrangler publish
   ```

## Usage

Once deployed, you can use the worker by sending POST requests to your worker's URL. The worker supports both multipart form-data and JSON request bodies. Here are examples of both:

### Using multipart form-data:

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev \
  -F "source=@/path/to/your/image.jpg" \
  -F "apiKey=YOUR_API_KEY" \
  -F 'resize={"method":"fit","width":300,"height":200}' \
  -F 'preserve=["copyright","creation"]' \
  -F "callbackUrl=https://your-callback-url.com/endpoint"
```

### Using JSON:

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -H "Api-Key: YOUR_API_KEY" \
  -H "Callback-Url: https://your-callback-url.com/endpoint" \
  -d '{
    "source": {
      "url": "https://example.com/path/to/image.jpg"
    },
    "resize": {
      "method": "fit",
      "width": 300,
      "height": 200
    },
    "preserve": ["copyright", "creation"]
  }'
```

## Debugging

To debug the worker locally, you can use the provided debug server along with ngrok. This setup will allow you to test your worker, including the callback functionality, without actually compressing images or sending them to a live endpoint.

### Setting up the Debug Server

1. Run the debug server:
   ```
   python debug_server.py
   ```

The server will start and listen on `http://localhost:5000`.

### Using ngrok with the Debug Server

To make your local debug server accessible from the public internet (which is necessary for testing the callback functionality), we'll use ngrok:

1. Install ngrok by following the instructions on the [ngrok website](https://ngrok.com/download).

2. With your debug server running, open a new terminal window and start ngrok:
   ```
   ngrok http 5000
   ```

3. ngrok will provide you with a public URL (e.g., `https://1234abcd.ngrok.io`). This URL will forward to your local debug server.

### Using the Debug Setup

1. Modify your worker code to send requests to your ngrok URL instead of the actual Tinify API or your production callback URL.

2. Deploy your worker to a test environment or run it locally using `wrangler dev`.

3. Send requests to your worker as you normally would, but use the ngrok URL as the callback URL:
   ```bash
   curl -X POST https://your-worker.your-subdomain.workers.dev \
     -F "source=@/path/to/your/image.jpg" \
     -F "apiKey=YOUR_API_KEY" \
     -F "callbackUrl=https://1234abcd.ngrok.io"
   ```

4. Check the console output of the debug server to see the incoming requests and headers.

5. If an image is received, it will be saved as `testimage.png` in the same directory as the debug server.

6. You can also check the ngrok web interface (usually at `http://localhost:4040`) to inspect the requests and responses.

This setup allows you to debug your worker's behavior, including the callback functionality, without actually processing or sending images to a live endpoint. It's particularly useful for testing how your worker handles different types of responses and ensuring that callbacks are working correctly.

## Contributing

We welcome contributions to improve the Tinify Webhook Cloudflare Worker. Please feel free to submit issues, fork the repository and send pull requests!

## About [srvrlss.io](https://srvrlss.io)

[srvrlss.io](https://srvrlss.io) is a platform focused on providing serverless solutions and tools for modern web applications. Our goal is to simplify the deployment of serverless architectures, making them more accessible and efficient for developers. From optimizing workflows to handling high-traffic use cases, srvrlss.io delivers lightweight and scalable cloud-native services.

This repository contains our serverless proxy for Tinify, built using Cloudflare Workers. It enables efficient image compression via Tinify's API, using the power of serverless technology to scale seamlessly without the need for dedicated infrastructure.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
