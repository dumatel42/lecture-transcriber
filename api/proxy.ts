export const config = {
  runtime: 'edge',
  regions: ['fra1'], // Frankfurt, Germany (EU Central - 100% authorized for Google Gemini)
};

// Whitelist allowed target hosts to prevent open proxy abuse
const ALLOWED_HOSTS = [
  'generativelanguage.googleapis.com'
];

function isAllowedHost(host: string): boolean {
  const h = host.toLowerCase();
  return ALLOWED_HOSTS.includes(h) || h.endsWith('.googleapis.com');
}

export default async function handler(req: Request): Promise<Response> {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': '*',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  try {
    const reqUrl = new URL(req.url);
    const targetUrlParam = reqUrl.searchParams.get('url');

    if (!targetUrlParam) {
      return new Response(JSON.stringify({ error: 'Missing "url" parameter for proxy gateway.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    let parsedTarget: URL;
    try {
      parsedTarget = new URL(targetUrlParam);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid "url" parameter provided.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!isAllowedHost(parsedTarget.host)) {
      return new Response(JSON.stringify({ error: `Host ${parsedTarget.host} is not allowed.` }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 2. Prepare headers for forwarding to Google
    const forwardHeaders = new Headers();
    req.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      // Skip hop-by-hop and client geo headers to protect European routing
      if ([
        'host', 'connection', 'content-length', 'transfer-encoding',
        'x-forwarded-for', 'x-real-ip', 'x-vercel-ip-country',
        'x-vercel-ip-country-region', 'x-vercel-ip-city', 'x-vercel-ip-timezone',
        'x-vercel-ip-as-number', 'x-vercel-ip-continent'
      ].includes(lower)) {
        return;
      }
      forwardHeaders.set(key, val);
    });

    // Explicitly set host to target Google API host
    forwardHeaders.set('host', parsedTarget.host);

    // 3. Forward request to Google
    const method = req.method.toUpperCase();
    const hasBody = !['GET', 'HEAD'].includes(method);

    const fetchInit: any = {
      method,
      headers: forwardHeaders,
      body: hasBody ? req.body : undefined,
      redirect: 'follow',
      duplex: 'half'
    };

    const googleResp = await fetch(parsedTarget.toString(), fetchInit);

    // 4. Build response headers to return to client
    const responseHeaders = new Headers();
    googleResp.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      // Skip encoding header to avoid decompression mismatch
      if (['content-encoding', 'transfer-encoding', 'connection'].includes(lower)) {
        return;
      }
      responseHeaders.set(key, val);
    });

    // If Google returned an upload URL header, rewrite it to point through our proxy!
    const uploadUrlHeader = googleResp.headers.get('x-goog-upload-url');
    if (uploadUrlHeader) {
      const proxiedUploadUrl = `${reqUrl.origin}/api/proxy?url=${encodeURIComponent(uploadUrlHeader)}`;
      responseHeaders.set('x-goog-upload-url', proxiedUploadUrl);
    }

    // Add CORS headers so browser client can access all headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('Access-Control-Expose-Headers', 'x-goog-upload-url, x-goog-upload-status, x-goog-upload-chunk-granularity, x-goog-upload-size-received, *');

    // 5. Return streamed response to client
    return new Response(googleResp.body, {
      status: googleResp.status,
      statusText: googleResp.statusText,
      headers: responseHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Proxy Gateway Error', message: err.message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
