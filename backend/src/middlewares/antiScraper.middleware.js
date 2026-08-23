const bannedIPs = new Map(); // Stores banned IPs with expiration timestamp (24 hours)

// Known bot and scraper User-Agent signatures
const BLOCKED_USER_AGENTS = [
  'python',
  'python-requests',
  'urllib',
  'aiohttp',
  'scrapy',
  'beautifulsoup',
  'curl',
  'wget',
  'go-http-client',
  'java',
  'postmanruntime',
  'insomnia',
  'headlesschrome',
  'phantomjs',
  'puppeteer',
  'playwright',
  'selenium',
  'httpx',
  'node-fetch',
  'axios/0.',
];

/**
 * Middleware to block scrapers, automated bots, and banned IPs
 */
function antiScraperMiddleware(req, res, next) {
  // Always allow CORS preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Always allow keep-alive health check
  if (req.path === '/api/health') {
    return next();
  }

  // If request comes from trusted NoteShare frontend or mobile app, allow through
  const origin = req.headers['origin'] || req.headers['referer'] || '';
  const isTrustedOrigin = 
    origin.includes('noteshare.online') || 
    origin.includes('localhost') || 
    origin.includes('capacitor://');

  if (isTrustedOrigin) {
    return next();
  }

  const clientIP =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '0.0.0.0';

  // 1. Check if IP is currently banned
  if (bannedIPs.has(clientIP)) {
    const banExpiration = bannedIPs.get(clientIP);
    if (Date.now() < banExpiration) {
      return res.status(403).json({
        message: 'Access denied: Your IP address has been flagged and blocked due to suspicious automated activity.',
      });
    } else {
      bannedIPs.delete(clientIP); // Ban expired
    }
  }

  // 2. Check User-Agent header for automated scraping tools
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  // If no User-Agent is provided (common in raw Python/curl scripts)
  if (!userAgent || userAgent.length < 5) {
    return res.status(403).json({
      message: 'Access denied: Missing browser User-Agent header.',
    });
  }

  // Check if User-Agent matches any known scraper signature
  const isScraper = BLOCKED_USER_AGENTS.some((signature) =>
    userAgent.includes(signature)
  );

  if (isScraper) {
    // Ban scraper IP for 24 hours
    bannedIPs.set(clientIP, Date.now() + 24 * 60 * 60 * 1000);
    return res.status(403).json({
      message: 'Access denied: Automated scrapers and HTTP bots are prohibited on NoteShare.',
    });
  }

  next();
}

/**
 * Honeypot endpoint handler to trap and ban malicious web scrapers
 */
function honeypotTrapHandler(req, res) {
  const clientIP =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '0.0.0.0';

  // Instantly ban the scraper IP for 24 hours
  bannedIPs.set(clientIP, Date.now() + 24 * 60 * 60 * 1000);

  return res.status(403).json({
    message: 'Access Denied: You have triggered NoteShare Honeypot Security. Your IP has been banned for 24 hours.',
  });
}

module.exports = {
  antiScraperMiddleware,
  honeypotTrapHandler,
};
