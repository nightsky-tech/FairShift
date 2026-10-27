/**
 * FairShift Platform Server
 * Optimized for Google Cloud Run deployment (SDG 8: Decent Work & Economic Growth)
 * Zero external dependencies for instant cold-starts (< 20ms) and repository size < 1MB.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

// In-memory cache and static trace anchor for Vercel Serverless / Cloud Run
let cachedIndexHtml = null;
try {
  cachedIndexHtml = fs.readFileSync(path.join(__dirname, 'index.html'));
} catch (e1) {
  try {
    cachedIndexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'));
  } catch (e2) {}
}

function findFilePath(relPath) {
  const clean = relPath.replace(/^[\/\\]+/, '');
  const searchRoots = [
    __dirname,
    process.cwd(),
    path.join(__dirname, '..'),
    path.join(process.cwd(), '..')
  ];
  for (const r of searchRoots) {
    const candidate = path.resolve(r, clean);
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch (_) {}
  }
  return null;
}

const server = http.createServer((req, res) => {
  // Security Headers (OWASP recommended defense-in-depth)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self)');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://fonts.googleapis.com https://fonts.gstatic.com;"
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let pathname;
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  // Health Check Endpoint
  if (pathname === '/health' || pathname === '/_health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'fairshift-platform',
      version: '1.0.0',
      sdgTarget: 'SDG 8: Decent Work & Economic Growth',
      cloudRunReady: true,
      deployedOn: 'Vercel / Cloud Run',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Reject null-byte attacks
  if (pathname.includes('\0')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  // Route HTML / root requests
  const isHtmlRoute = (
    pathname === '/' ||
    pathname === '' ||
    pathname === '/index.html' ||
    pathname === '/index' ||
    !path.extname(pathname)
  );

  if (isHtmlRoute) {
    const indexPath = findFilePath('index.html');
    if (indexPath) {
      try {
        const content = fs.readFileSync(indexPath);
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(content);
        return;
      } catch (_) {}
    }

    if (cachedIndexHtml) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(cachedIndexHtml);
      return;
    }
  }

  // Route static assets (CSS, JS, images, fonts)
  const cleanPath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const existingFile = findFilePath(cleanPath);

  if (existingFile) {
    const ext = path.extname(existingFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    try {
      const content = fs.readFileSync(existingFile);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      res.end(content);
      return;
    } catch (_) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
  }

  // SPA fallback for unmapped client paths
  if (cachedIndexHtml) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(cachedIndexHtml);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end(`404 Not Found: ${pathname}`);
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🚀 FairShift (SDG 8) Platform is running!`);
    console.log(`📍 Local URL:     http://localhost:${PORT}`);
    console.log(`🌐 Host Address:  http://${HOST}:${PORT}`);
    console.log(`🩺 Health Check:  http://localhost:${PORT}/health`);
    console.log(`☁️  Cloud Run:    Ready for Google Cloud Run deployment`);
    console.log(`====================================================`);
  });
}

module.exports = server;
