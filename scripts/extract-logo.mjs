// 从 potrace 结果提取 Segoe Script 连笔字形，生成渐变 logo SVG
import { readFileSync, writeFileSync } from 'node:fs';

const src = 'E:/BLOG/.dsh-vision-router/artifacts/.vision-run-mthaoisq-30f4fb3a-3751-45fc-94e8-7d82a4d13526/E--BLOG-.dsh-vision-router-artif-249fb791-trace-2.svg';
const svg = readFileSync(src, 'utf8');

// 取第二个（实心）图层的 d
const paths = [...svg.matchAll(/<path[^>]*fill-opacity="([^"]+)"[^>]*d="([^"]+)"/g)];
const solid = paths.find((p) => Math.abs(parseFloat(p[1]) - 0.752) < 0.05) ?? paths[paths.length - 1];
const d = solid[2];

// 计算数值 bbox
const nums = [...d.matchAll(/-?\d+\.?\d*/g)].map((m) => parseFloat(m[0]));
const xs = nums.filter((_, i) => i % 2 === 0);
const ys = nums.filter((_, i) => i % 2 === 1);
const minX = Math.min(...xs) - 12;
const minY = Math.min(...ys) - 12;
const w = Math.max(...xs) - minX + 12;
const h = Math.max(...ys) - minY + 12;

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}">
  <defs>
    <linearGradient id="vb-grad" x1="${minX.toFixed(1)}" y1="${minY.toFixed(1)}" x2="${(minX + w).toFixed(1)}" y2="${(minY + h).toFixed(1)}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8ec5f7"/>
      <stop offset="0.55" stop-color="#5b9bd5"/>
      <stop offset="1" stop-color="#2f6fd0"/>
    </linearGradient>
  </defs>
  <path fill="url(#vb-grad)" d="${d}"/>
</svg>
`;
writeFileSync('E:/blogb/public/logo-mark.svg', logoSvg);
console.log('bbox:', minX.toFixed(0), minY.toFixed(0), w.toFixed(0), h.toFixed(0));
console.log('written E:/blogb/public/logo-mark.svg, path len:', d.length);
