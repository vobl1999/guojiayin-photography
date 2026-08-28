/**
 * 照片导入助手：扫描 src/assets/gallery/ 里没有说明文件的新照片，
 * 自动在 src/content/gallery/ 生成同名 .md（能读到 EXIF 就带上相机/镜头信息）。
 * 用法：node scripts/add-photos.mjs
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const galleryDir = 'src/assets/gallery';
const sidecarDir = 'src/content/gallery';
const exts = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];

const norm = (s) => s.toLowerCase().replace(/\s+/g, '-');

const existing = new Set(
  readdirSync(sidecarDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => norm(f.replace(/\.md$/, '')))
);

let created = 0;
for (const f of readdirSync(galleryDir)) {
  const ext = f.slice(f.lastIndexOf('.')).toLowerCase();
  if (!exts.includes(ext)) continue;
  const base = f.replace(/\.[^.]+$/, '');
  if (existing.has(norm(base))) continue;

  // 尽力读 EXIF（sharp 的 ifd0 含 Make/Model/LensModel）
  let camera = '';
  try {
    const meta = await sharp(join(galleryDir, f)).metadata();
    const make = (meta.ifd0?.Make || '').trim();
    const model = (meta.ifd0?.Model || '').trim();
    const lens = (meta.ifd0?.LensModel || '').trim();
    camera = [make, model].filter(Boolean).join(' ');
    if (lens) camera += ` · ${lens}`;
  } catch {}

  const title = base.replace(/[-_]+/g, ' ');
  const md = `---\ntitle: ${title}\ntitleZh: ${title}\n${camera ? `camera: ${camera}\n` : ''}---\n`;
  writeFileSync(join(sidecarDir, `${base}.md`), md);
  console.log(`已生成: ${base}.md${camera ? `  (EXIF: ${camera})` : '  (无 EXIF)'}`);
  created++;
}
console.log(created ? `✅ 完成，生成 ${created} 个说明文件。` : '没有需要处理的新照片。');
