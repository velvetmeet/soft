// VELVETMEET MIDDLEWARE
// Geo-IP language detection
// Optional cloaking (off by default)
// Bot logging (always on, for analysis)

// CLOAKING toggle
const CLOAKING_ENABLED = false;

// Bot logging to Cloudflare logs
const BOT_LOGGING_ENABLED = true;

// User-Agent patterns that trigger bot detection
// NOTE: "instagram" and "whatsapp" removed to avoid false positives
// on in-app browsers (real users coming from Instagram/WhatsApp)
const BOT_PATTERNS = [
  // Meta crawlers
  "facebookexternalhit",
  "facebookcatalog",
  "meta-externalagent",
  "meta-externalfetcher",
  
  // Other social
  "twitterbot",
  "linkedinbot",
  "pinterestbot",
  "telegrambot",
  "discordbot",
  "slackbot",
  
  // Search engines
  "googlebot",
  "google-inspectiontool",
  "bingbot",
  "yandexbot",
  "duckduckbot",
  "baiduspider",
  "applebot",
  "amazonbot",
  
  // AI crawlers
  "anthropic-ai",
  "claudebot",
  "gptbot",
  "chatgpt-user",
  "perplexitybot",
  "bytedancespider",
  "ccbot",
  "diffbot",
  
  // SEO/analytics tools
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "screaming frog",
  "rogerbot",
  "ia_archiver",
  
  // Headless / automation
  "headless",
  "phantomjs",
  "selenium",
  "puppeteer",
  "playwright",
  "chrome-lighthouse",
  
  // Generic
  "bot/",
  "spider",
  "crawler",
  "scraper"
];

// Meta IP prefixes (2026)
const META_IP_PREFIXES = [
  "66.220.144.", "66.220.145.", "66.220.146.", "66.220.147.",
  "66.220.148.", "66.220.149.", "66.220.150.", "66.220.151.",
  "66.220.152.", "66.220.153.", "66.220.154.", "66.220.155.",
  "66.220.156.", "66.220.157.", "66.220.158.", "66.220.159.",
  "69.171.224.", "69.171.225.", "69.171.226.", "69.171.227.",
  "69.171.228.", "69.171.229.", "69.171.230.", "69.171.231.",
  "69.171.232.", "69.171.233.", "69.171.234.", "69.171.235.",
  "69.171.236.", "69.171.237.", "69.171.238.", "69.171.239.",
  "69.171.240.", "69.171.241.", "69.171.242.", "69.171.243.",
  "69.171.244.", "69.171.245.", "69.171.246.", "69.171.247.",
  "69.171.248.", "69.171.249.", "69.171.250.", "69.171.251.",
  "69.171.252.", "69.171.253.", "69.171.254.", "69.171.255.",
  "157.240.", "173.252.", "204.15.20.",
  "31.13.", "129.134.", "185.60."
];

// CLOAKED PAGE — shown to bots when cloaking is enabled
const CLOAKED_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Mindful Mornings &mdash; Slow Living Journal</title>
<style>
body{font-family:Georgia,serif;background:#f3ede4;color:#1e1a16;max-width:680px;margin:0 auto;padding:40px 24px;line-height:1.7}
h1{font-size:28px;font-weight:600;margin-bottom:8px}
h2{font-size:20px;margin-top:32px;font-weight:600}
p{font-size:16px;margin-bottom:16px;color:#3c3530}
.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#b8742a;margin-bottom:24px}
.footer{margin-top:48px;padding-top:24px;border-top:1px solid #e6dccb;color:#7a7269;font-size:13px}
</style>
</head>
<body>
<div class="eyebrow">A slow living journal</div>
<h1>Mindful Mornings</h1>
<p>A weekly note about rituals, rain, books, and quiet rooms &mdash; for people who want a slower life after fifty.</p>

<h2>This week's letter</h2>
<p>October arrived softly this year. The kind of morning where you stand by the window with both hands around a cup, and watch the leaves do their slow falling.</p>
<p>We talk a lot about productivity. We talk less about <em>permission</em> &mdash; permission to slow down, to read for an hour, to call an old friend without a reason.</p>
<p>This is a place for that.</p>

<h2>About</h2>
<p>Mindful Mornings is a small publication based in Europe. We write about books, slow rituals, and the soft work of starting again at any age.</p>

<div class="footer">&copy; 2026 Mindful Mornings &middot; A reading and rituals journal</div>
</body>
</html>`;

// HELPERS

function isBotByUA(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some(pattern => ua.includes(pattern));
}

function isMetaIP(ip) {
  if (!ip) return false;
  return META_IP_PREFIXES.some(prefix => ip.startsWith(prefix));
}

function logBot(request, reason) {
  if (!BOT_LOGGING_ENABLED) return;
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "none";
  const country = request.headers.get("cf-ipcountry") || "??";
  console.log(JSON.stringify({
    type: "bot_detected",
    reason: reason,
    ip: ip,
    ua: ua,
    country: country,
    url: request.url,
    time: new Date().toISOString()
  }));
}

function logHuman(request) {
  if (!BOT_LOGGING_ENABLED) return;
  // Sample 5% of human traffic for baseline
  if (Math.random() > 0.05) return;
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "none";
  const country = request.headers.get("cf-ipcountry") || "??";
  console.log(JSON.stringify({
    type: "human_sample",
    ip: ip,
    ua: ua,
    country: country,
    url: request.url,
    time: new Date().toISOString()
  }));
}

// MAIN

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  
  // === SKIP MIDDLEWARE FOR /go ===
  // Let /go redirect cleanly without any processing
  if (url.pathname === "/go") {
    return context.next();
  }
  
  const userAgent = request.headers.get("user-agent") || "";
  const ip = request.headers.get("cf-connecting-ip") || "";
  
  // Bot detection
  const botByUA = isBotByUA(userAgent);
  const botByIP = isMetaIP(ip);
  const isBot = botByUA || botByIP;
  
  // Logging
  if (isBot) {
    logBot(request, botByUA ? "user_agent" : "meta_ip");
  } else {
    logHuman(request);
  }
  
  // CLOAKING — return decoy page to bots
  if (CLOAKING_ENABLED && isBot) {
    return new Response(CLOAKED_HTML, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex,nofollow"
      }
    });
  }
  
  // NORMAL FLOW — pass through and inject country
  const response = await context.next();
  
  // If response is a redirect (3xx), return as-is — never patch redirects
  if (response.status >= 300 && response.status < 400) {
    return response;
  }
  
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return response;
  
  const country = request.headers.get("cf-ipcountry") || "";
  const html = await response.text();
  const patched = html.replace(
    "</head>",
    `<script>window.__VM_COUNTRY=${JSON.stringify(country)};</script></head>`
  );
  
  return new Response(patched, {
    status: response.status,
    headers: response.headers,
  });
}
