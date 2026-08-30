// 精准验证主站三项修复
const B = 'https://guojiayin-photography.pages.dev';
(async () => {
  const html = await (await fetch(B + '/en/gallery/')).text();
  const cssHref = html.match(/href="(\/_astro\/[^"]+\.css)"/)?.[1];
  if (cssHref) {
    const css = await (await fetch(B + cssHref)).text();
    console.log('lightbox fix (max-height 预留):', css.includes('calc(100vh - 10.5rem)'));
  } else {
    console.log('lightbox css: not found');
  }

  const home = await (await fetch(B + '/en/')).text();
  // 页脚 RSS 链接应该没了（排除 head 里的 <link rel=alternate>）
  const footerLink = /<footer[\s\S]*?<\/footer>/.exec(home)?.[0] ?? '';
  console.log('footer RSS link removed:', !footerLink.includes('href="/rss.xml"'));
  console.log('head RSS alternate kept:', home.includes('application/rss+xml'));

  // RSS 重定向
  const r = await fetch(B + '/rss.xml', { redirect: 'manual' });
  console.log('rss.xml redirect:', r.status, '->', r.headers.get('location') || '-');
})();
