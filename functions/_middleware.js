/**
 * Cloudflare Pages 边缘中间件：系统语言自动检测
 * - 浏览器首选语言为中文（Accept-Language 以 zh 开头）→ 根路径 302 到 /zh（中文版）
 * - 其他语言 → 保持 /（英文版）
 * 只处理根路径，其余路径原样放行。
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 只干预根路径；显式访问 /zh、/en、子页面都不动
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const acceptLang = context.request.headers.get('Accept-Language') || '';
    if (acceptLang.trim().toLowerCase().startsWith('zh')) {
      return Response.redirect(new URL('/zh', url), 302);
    }
  }

  return context.next();
}
