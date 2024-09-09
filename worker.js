addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method !== 'POST') {
    const html = btoa(gethtml());
    return new Response(atob(html), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  try {
    let source, apiKey, resizeOptions, preserveMetadata, callbackUrl

    // Check if content type is multipart form-data
    const contentType = request.headers.get('Content-Type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      source = formData.get('source')
      apiKey = formData.get('apiKey')
      resizeOptions = formData.get('resize')
      preserveMetadata = formData.get('preserve')
      callbackUrl = formData.get('callbackUrl')
    } else {
      // If not form-data, expect the values in headers and body
      apiKey = request.headers.get('Api-Key')
      callbackUrl = request.headers.get('Callback-Url')
      
      // Parse the body as JSON
      const bodyJson = await request.json()
      source = bodyJson.source.url
      resizeOptions = bodyJson.resize
      preserveMetadata = bodyJson.preserve
    }

    if (!source || !apiKey) {
      return new Response('Missing source or API key', { status: 400 })
    }

    // First shrink request
    let tinifyResponse = await fetch('https://api.tinify.com/shrink', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('api:' + apiKey),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source: {url: source} })
    })

    if (!tinifyResponse.ok) {
      const errorData = await tinifyResponse.json()
      throw new Error(`Tinify API error: ${errorData.message || tinifyResponse.status}`)
    }

    let tinifyData = await tinifyResponse.json()
    console.log(tinifyResponse);
    
    let outputUrl = tinifyResponse.headers.get('Location');
    console.log(outputUrl);

    // If resize options are provided, make a second request
    if (resizeOptions || preserveMetadata) {
      const options = {}
      if (resizeOptions) options.resize = resizeOptions
      if (preserveMetadata) options.preserve = preserveMetadata

      console.log(options)

      tinifyResponse = await fetch(outputUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('api:' + apiKey),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options)
      })

      if (!tinifyResponse.ok) {
        const errorData = await tinifyResponse.json()
        throw new Error(`Tinify API error during resize: ${errorData.message || tinifyResponse.status}`)
      }

      // Image is right here in tinifyResponse.body
      const resizeBuffer = tinifyResponse.body;

    }

    let imageResponse = null;
    // Download the final image
    if(!resizeOptions) {
      console.log("output url: ", outputUrl)
      imageResponse = await fetch(outputUrl, {
        headers: {
          'Authorization': 'Basic ' + btoa('api:' + apiKey),
        },
      })

    if (!imageResponse.ok) {
      throw new Error(`Failed to download compressed image: ${imageResponse.status}`)
    }

    } else {
      imageResponse = tinifyResponse;
    }


    const imageBuffer = await imageResponse.arrayBuffer() 
    const imageType = imageResponse.headers.get('Content-Type')
    console.log(imageType);

    // If a callback URL is provided, send the result there
    if (callbackUrl) {
      const callbackResponse = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': imageType,
        },
        body: imageBuffer
      })

      if (!callbackResponse.ok) {
        throw new Error(`Callback request failed with status ${callbackResponse.status}`)
      }

      return new Response('Processing complete, result sent to callback URL', { status: 200 })
    } else {
      // If no callback URL, return the compressed image directly
      return new Response(imageBuffer, { 
        status: 200, 
        headers: { 'Content-Type': imageType }
      })
    }
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}

function gethtml() {
  const decodeAndFormat = (base64String) => {
    const decoded = atob(base64String);
    return decoded.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;')
                  .replace(/\n/g, '<br>')
                  .replace(/\s/g, '&nbsp;');
  };

  const formDataExample = "Y3VybCAtWCBQT1NUIGh0dHBzOi8veW91ci13b3JrZXIueW91ci1zdWJkb21haW4ud29ya2Vycy5kZXYgXAogIC1GICJzb3VyY2U9QC9wYXRoL3RvL3lvdXIvaW1hZ2UuanBnIiBcCiAgLUYgImFwaUtleT1ZT1VSX0FQSV9LRVkiIFwKICAtRiAncmVzaXplPXsibWV0aG9kIjoiZml0Iiwid2lkdGgiOjMwMCwiaGVpZ2h0IjoyMDB9JyBcCiAgLUYgJ3ByZXNlcnZlPVsiY29weXJpZ2h0IiwiY3JlYXRpb24iXScgXAogIC1GICJjYWxsYmFja1VybD1odHRwczovL3lvdXItY2FsbGJhY2stdXJsLmNvbS9lbmRwb2ludCI=";

  const jsonExample = "Y3VybCAtWCBQT1NUIGh0dHBzOi8veW91ci13b3JrZXIueW91ci1zdWJkb21haW4ud29ya2Vycy5kZXYgXAogIC1IICJDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb24iIFwKICAtSCAiQXBpLUtleTogWU9VUl9BUElfS0VZIiBcCiAgLUggIkNhbGxiYWNrLVVybDogaHR0cHM6Ly95b3VyLWNhbGxiYWNrLXVybC5jb20vZW5kcG9pbnQiIFwKICAtZCAnewogICAgInNvdXJjZSI6IHsKICAgICAgInVybCI6ICJodHRwczovL2V4YW1wbGUuY29tL3BhdGgvdG8vaW1hZ2UuanBnIgogICAgfSwKICAgICJyZXNpemUiOiB7CiAgICAgICJtZXRob2QiOiAiZml0IiwKICAgICAgIndpZHRoIjogMzAwLAogICAgICAiaGVpZ2h0IjogMjAwCiAgICB9LAogICAgInByZXNlcnZlIjogWyJjb3B5cmlnaHQiLCAiY3JlYXRpb24iXQogIH0n";

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tinify Webhook Proxy</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
          pre {
              background-color: #f8f9fa;
              padding: 1rem;
              border-radius: 0.3rem;
              white-space: pre-wrap;
              word-wrap: break-word;
          }
      </style>
  </head>
  <body>
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
          <div class="container">
              <a class="navbar-brand" href="#">Tinify Webhook Proxy</a>
          </div>
      </nav>
  
      <div class="container my-5">
          <h1 class="mb-4">Tinify Webhook Proxy</h1>
          
          <section class="mb-5">
              <h2>What is this?</h2>
              <p>The Tinify Webhook Proxy is a Cloudflare Worker that acts as a flexible proxy for the Tinify image compression API. It allows you to compress images using Tinify's service with added flexibility in how you submit your requests.</p>
          </section>
  
          <section class="mb-5">
              <h2>Features</h2>
              <ul>
                  <li>Supports both multipart form-data and JSON request bodies</li>
                  <li>Accepts image sources as file uploads, URLs, or base64 encoded data</li>
                  <li>Allows for Tinify API options like resize and metadata preservation</li>
                  <li>Can return results directly or send them to a callback URL</li>
                  <li>Provides flexible error handling</li>
              </ul>
          </section>
  
          <section class="mb-5">
              <h2>How to Use</h2>
              <p>You can interact with the Tinify Webhook Proxy using either multipart form-data or JSON requests. Here are examples of both:</p>
  
              <h3 class="mt-4">Using multipart form-data:</h3>
              <pre><code>${decodeAndFormat(formDataExample)}</code></pre>
  
              <h3 class="mt-4">Using JSON:</h3>
              <pre><code>${decodeAndFormat(jsonExample)}</code></pre>
          </section>
  
          <section class="mb-5">
              <h2>Parameters</h2>
              <ul>
                  <li><strong>source:</strong> The image to be compressed. Can be a file upload, a URL, or base64 encoded data.</li>
                  <li><strong>apiKey:</strong> Your Tinify API key.</li>
                  <li><strong>resize (optional):</strong> Resizing options for the image.</li>
                  <li><strong>preserve (optional):</strong> Metadata to preserve in the compressed image.</li>
                  <li><strong>callbackUrl (optional):</strong> URL to send the compression results to. If not provided, results are returned directly.</li>
              </ul>
          </section>
  
          <section>
              <h2>Response</h2>
              <p>If a callback URL is provided, the worker will send the Tinify API response to that URL and return a success message. If no callback URL is provided, the worker will return the Tinify API response directly.</p>
          </section>
      </div>
  
      <footer class="bg-light py-3 mt-5">
          <div class="container text-center">
              <p>&copy; 2023 Tinify Webhook Proxy. All rights reserved.</p>
          </div>
      </footer>
  
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  </body>
  </html>`;
}
