// 下载 Pacifico TTF（fonts.gstatic）
import { writeFileSync } from 'node:fs';
(async () => {
  const css = await (
    await fetch('https://fonts.googleapis.com/css2?family=Pacifico&display=swap', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0' },
    })
  ).text();
  const url = css.match(/url\((https:\/\/[^)]+\.ttf)\)/)?.[1];
  console.log('font url:', url ? url : 'missing');
  if (url) {
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    writeFileSync('E:/BLOG/.fonts/Pacifico-Regular.ttf', buf);
    console.log('saved', buf.length, 'bytes');
  }
})();
