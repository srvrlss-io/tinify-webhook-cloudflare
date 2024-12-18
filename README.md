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


## Why We Created This

Tinify is an excellent service for image compression, offering high-quality results with significant file size reductions. However, integrating Tinify into modern serverless architectures and no/low-code environments can present several challenges:

1. **Lack of Webhook Support**: Tinify's API doesn't provide native webhook functionality, making it difficult to integrate with event-driven serverless architectures.

2. **Long-Running Requests**: Image compression, especially for larger files, can sometimes take longer than 30 seconds. This exceeds the timeout limits of many serverless platforms, including AWS Lambda and Cloudflare Workers.

3. **Serverless Environment Limitations**: Many serverless environments have restrictions on request durations, making it challenging to work with potentially long-running image compression tasks.

4. **Integration with No/Low-Code Platforms**: Platforms like Zapier and Make.com often require webhook support for seamless integration, which Tinify doesn't natively provide.

To address these challenges, we created this Cloudflare Worker. It serves as a bridge between Tinify's powerful compression API and modern serverless architectures. Our solution:

- Implements a webhook system, allowing for asynchronous processing and integration with event-driven architectures.
- Handles long-running requests by managing the compression process and delivering results via callbacks, circumventing timeout issues.
- Provides a flexible interface that supports various input methods, making it easy to integrate with different systems and platforms.
- Opens up possibilities for no-code and low-code environments to leverage Tinify's image compression capabilities without complex backend setups.

By using this Cloudflare Worker, developers can easily incorporate Tinify's excellent image compression into their serverless workflows, event-driven architectures, and no/low-code platforms, overcoming the limitations that previously made such integrations challenging.

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

## About [srvrlss.io](https://srvrlss.io)

[srvrlss.io](https://srvrlss.io) is a website dedicated to providing information and resources about serverless platforms. It features comparisons of serverless solutions, news, and guides related to serverless technology. The focus of srvrlss.io is to help users understand different serverless offerings and their applications, making it easier for developers and organizations to choose the right platform for their projects. The site emphasizes the benefits of serverless architecture, while also addressing the challenges.

srvrlss.io also provides custom serverless solutions and tools. Our goal is to simplify the deployment of serverless architectures, making them more accessible and efficient for developers.

This repository contains our serverless webhook addition proxy for Tinify, built using Cloudflare Workers. It enables working with webhooks via Tinify's API, using the power of serverless technology to scale seamlessly without the need for dedicated infrastructure.


## Contributing

We welcome contributions to this Tinify proxy / Webhook Cloudflare Worker. Please feel free to submit issues, fork the repository and send pull requests!

