const B = 'https://guojiayin-photography.pages.dev';
(async () => {
  const html = await (await fetch(B + '/en/gallery/')).text();
  const hrefs = [...new Set([...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)].map((m) => m[1]))];
  for (const href of hrefs) {
    const css = await (await fetch(B + href)).text();
    if (css.includes('lb-img')) {
      const i = css.indexOf('.lb-img');
      console.log('file:', href);
      console.log(css.slice(i, i + 320));
      return;
    }
  }
  console.log('lb-img not found in any css chunk. files:', hrefs.length);
})();
