/**
 * 原图下载通道：/downloads/文件名
 * 由本站同域转发 R2 原图，并强制 Content-Disposition: attachment ——
 * 浏览器会真正"下载"而不是在新标签页打开。
 */
const R2_BASE = 'https://pub-7d773d4fe41a44659b035738f0562d96.r2.dev';
const SAFE = /^[\w .-]+\.(jpg|jpeg|png|webp|avif)$/i;

export async function onRequest(context) {
  let file = context.params.file || '';

  // 路由参数可能是 URL 编码的（如 %20），先解码再校验
  try {
    file = decodeURIComponent(file);
  } catch {}

  if (!SAFE.test(file)) {
    return new Response('Not found', { status: 404 });
  }

  const res = await fetch(`${R2_BASE}/${encodeURIComponent(file)}`);
  if (!res.ok) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers(res.headers);
  headers.set('Content-Disposition', `attachment; filename="${file}"`);
  headers.set('Cache-Control', 'public, max-age=2592000');
  return new Response(res.body, { headers });
}
