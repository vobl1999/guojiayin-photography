/**
 * Cloudflare Pages 边缘中间件：
 * 1) 全站入口人机验证大门（Turnstile 通过后带 24h 签名 Cookie，无状态验证）
 *    豁免：静态资源、/gate.html、/api/、/downloads/、已验证爬虫、微信验证文件等
 * 2) 系统语言自动检测（zh → /zh）
 * 依赖 Pages secrets：GATE_SECRET（签名密钥；TURNSTILE_SECRET 由 api/gate 使用）
 */

const GATE_COOKIE = 'vobl_gate';
const GATE_PAGE = '/gate.html';

const EXEMPT_PREFIX = [
  '/gate.html',
  '/api/',
  '/_astro/',
  '/downloads/',
  '/favicon.svg',
  '/robots.txt',
  '/sitemap',
  '/og-default.jpg',
  '/icon-',
  '/manifest.webmanifest',
  '/rss.xml',
  '/6776ba54c36e226caa45ba0380aa0403', // 微信验证文件
];

const CRAWLER_RE =
  /googlebot|bingbot|baiduspider|yandex|duckduckbot|slurp|sogou|360spider|facebookexternalhit|twitterbot|applebot|bytespider|petalbot|semrushbot|ahrefsbot|mj12bot|uptimerobot/i;

async function hmacHex(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function gateOk(cookieValue, secret) {
  if (!cookieValue || !secret) return false;
  const dot = cookieValue.indexOf('.');
  if (dot <= 0) return false;
  const expires = Number(cookieValue.slice(0, dot));
  const sig = cookieValue.slice(dot + 1);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const expect = await hmacHex(String(expires), secret);
  // 恒时比较
  let diff = expect.length ^ sig.length;
  for (let i = 0; i < Math.max(expect.length, sig.length); i++) {
    diff |= (expect.charCodeAt(i) || 0) ^ (sig.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function needsGate(pathname) {
  return !EXEMPT_PREFIX.some((p) => pathname.startsWith(p));
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // ── 入口人机验证（页面类请求） ────────────────────────────
  const accept = context.request.headers.get('Accept') || '';
  const ua = context.request.headers.get('User-Agent') || '';
  const isPageNav =
    context.request.method === 'GET' && accept.includes('text/html') && !pathname.startsWith('/_astro/');
  const gateSecret = context.env.GATE_SECRET;

  if (gateSecret && isPageNav && needsGate(pathname) && !CRAWLER_RE.test(ua)) {
    const cookie = context.request.headers.get('Cookie') || '';
    const raw = cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${GATE_COOKIE}=`));
    const value = raw ? raw.slice(GATE_COOKIE.length + 1) : '';
    if (!(await gateOk(value, gateSecret))) {
      const next = pathname === GATE_PAGE ? '/' : pathname + url.search;
      return Response.redirect(
        new URL(`${GATE_PAGE}?next=${encodeURIComponent(next)}`, url),
        302
      );
    }
  }

  // ── 系统语言检测（只干预根路径） ──────────────────────────
  if (pathname === '/' || pathname === '/index.html') {
    const acceptLang = context.request.headers.get('Accept-Language') || '';
    if (acceptLang.trim().toLowerCase().startsWith('zh')) {
      return Response.redirect(new URL('/zh', url), 302);
    }
  }

  return context.next();
}
