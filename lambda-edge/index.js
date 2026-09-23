/**
 * omerdengiz.com: Lambda@Edge handler
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
/* 1. viewer-request: pretty URLs for a static S3 origin                      */
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
/* 2. viewer-response: security + caching headers                             */
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

  // Content Security Policy.
  //
  // Everything the site loads comes from its own origin: fonts are self-hosted
  // woff2 subsets emitted by the build, scripts are external ES modules, and
  // stylesheets are never inlined. There is therefore no third-party origin in
  // this policy and no 'unsafe-inline' anywhere.
  //
  // scripts/verify-csp.mjs parses this exact array and audits the built HTML
  // against it on every build, so a page that violates the policy fails CI
  // rather than silently breaking in production. Loosening anything here will
  // not go unnoticed, but it also will not be caught by the browser until it
  // ships, which is the whole reason that check exists.
  setHeader(headers, 'Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '));

  // Brag a little: no functional effect
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
