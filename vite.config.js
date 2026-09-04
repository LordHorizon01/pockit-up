import { defineConfig } from 'vite';

// In-Memory Sliding Window Rate Limiter for API protection
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50;

function rateLimitMiddleware(req, res, next) {
  if (!req.url || !req.url.startsWith('/api/')) {
    return next();
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = rateLimitMap.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(clientIp, record);

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - record.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded to protect system security. Please wait before retrying.',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
    }));
    return;
  }

  next();
}

export default defineConfig({
  server: {
    port: 5173,
    open: '/pdfmerger.html',
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            // Silently handle proxy error when Python microservice is not running
            if (!res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                status: 'offline',
                message: 'Python AI microservice offline; fallback to client-side engine.'
              }));
            }
          });
        }
      }
    }
  },
  plugins: [
    {
      name: 'security-rate-limiter',
      configureServer(server) {
        server.middlewares.use(rateLimitMiddleware);
      }
    }
  ]
});
