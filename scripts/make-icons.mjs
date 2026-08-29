/**
 * 生成 PWA 图标：由 public/favicon.svg 光栅化为 192/512 PNG
 * 用法：node scripts/make-icons.mjs
 */
import sharp from 'sharp';

for (const size of [192, 512]) {
  await sharp('public/favicon.svg').resize(size, size).png().toFile(`public/icon-${size}.png`);
  console.log(`✅ public/icon-${size}.png`);
}
