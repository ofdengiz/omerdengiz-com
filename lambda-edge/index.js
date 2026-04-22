/**
 * omerdengiz.com — Lambda@Edge handler
 *
 * One function, two CloudFront event associations:
 *   1. viewer-request   → normalize request URIs for S3 static hosting
 *   2. viewer-response  → inject security + caching headers on every response
 *
 * Runtime: nodejs20.x (us-east-1 only for Lambda@Edge)
 * Handler: index.handler
 * Memory : 128 MB
 * Timeout: 5 s   (viewer events are capped at 5s by CloudFront anyway)
 */

'use strict';

exports.handler = (event, context, callback) => {
  const record = event.Records[0];
  const cf = record.cf;
  const eventType = record.cf.config.eventType;

  if (eventType === 'viewer-request') {
    return handleViewerRequest(cf.request, callback);
  }
  if (eventType === 'viewer-response') {
    return handleViewerResponse(cf.response, callback);
  }
  // Fallback: pass through unchanged
  return callback(null, cf.request || cf.response);
};

/* -------------------------------------------------------------------------- */
/* 1. viewer-request — pretty URLs for a static S3 origin                      */
/* -------------------------------------------------------------------------- */
function handleViewerRequest(request, callback) {
  let uri = request.uri;

  // Directory-style paths: /about/ → /about/index.html
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
    return callback(null, request);
  }

  // Extensionless paths: /about → /about/index.html
  // Only rewrite when the last segment clearly has no extension.
  const lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment && !lastSegment.includes('.')) {
    request.uri = uri + '/index.html';
    return callback(null, request);
  }

  return callback(null, request);
}

/* -------------------------------------------------------------------------- */
/* 2. viewer-response — security + caching headers                             */
/* -------------------------------------------------------------------------- */
function handleViewerResponse(response, callback) {
  const headers = response.headers;

  // Strict Transport Security: force HTTPS for 2 years, include subdomains
  setHeader(headers, 'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload');

  // Clickjacking / MIME-sniffing / legacy XSS protection
  setHeader(headers, 'X-Frame-Options',        'DENY');
  setHeader(headers, 'X-Content-Type-Options', 'nosniff');
  setHeader(headers, 'Referrer-Policy',        'strict-origin-when-cross-origin');

  // Minimal modern permissions policy
  setHeader(headers, 'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  // Content Security Policy — site is HTML/CSS/JS with Google Fonts CSS only
  setHeader(headers, 'Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '));

  // Brag a little — no functional effect
  setHeader(headers, 'X-Served-By', 'lambda-edge');

  return callback(null, response);
}

/**
 * CloudFront headers are keyed by lowercase name, each value is an array of
 * { key, value } records. setHeader() overwrites any previous value.
 */
function setHeader(headers, name, value) {
  headers[name.toLowerCase()] = [{ key: name, value: value }];
}
