// 提取 Pacifico v 字形 → 渐变 logo + favicon
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('E:/BLOG/.dsh-vision-router/artifacts/.vision-run-mthav0gj-4277cab6-5703-4fa9-b8cb-b602f52362e9/E--BLOG-.dsh-vision-router-artif-773a89b0-trace-2.svg', 'utf8');
const paths = [...svg.matchAll(/<path[^>]*fill-opacity="([^"]+)"[^>]*d="([^"]+)"/g)];
const solid = paths.find((p) => Math.abs(parseFloat(p[1]) - 0.664) < 0.05) ?? paths[paths.length - 1];
const d = solid[2];

const nums = [...d.matchAll(/-?\d+\.?\d*/g)].map((m) => parseFloat(m[0]));
const xs = nums.filter((_, i) => i % 2 === 0);
const ys = nums.filter((_, i) => i % 2 === 1);
const minX = Math.min(...xs) - 10;
const minY = Math.min(...ys) - 10;
const w = Math.max(...xs) - minX + 10;
const h = Math.max(...ys) - minY + 10;

const make = (gradId, x1, y1, x2, y2) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}">
  <defs>
    <linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8ec5f7"/>
      <stop offset="0.55" stop-color="#5b9bd5"/>
      <stop offset="1" stop-color="#2f6fd0"/>
    </linearGradient>
  </defs>
  <path fill="url(#${gradId})" fill-rule="evenodd" d="${d}"/>
</svg>
`;

writeFileSync('E:/blogb/src/assets/logo-mark.svg', make('vb-grad', minX, minY, minX + w, minY + h));
console.log('logo bbox:', minX.toFixed(0), minY.toFixed(0), w.toFixed(0), h.toFixed(0));

// favicon：白底圆角 + 渐变 v
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 208">
  <rect x="8" y="8" width="464" height="192" rx="46" fill="#ffffff"/>
  <defs>
    <linearGradient id="g" x1="${minX.toFixed(1)}" y1="${minY.toFixed(1)}" x2="${(minX + w).toFixed(1)}" y2="${(minY + h).toFixed(1)}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8ec5f7"/>
      <stop offset="0.55" stop-color="#5b9bd5"/>
      <stop offset="1" stop-color="#2f6fd0"/>
    </linearGradient>
  </defs>
  <g transform="translate(${(140 - minX).toFixed(1)} ${(24 - minY).toFixed(1)})">
    <path fill="url(#g)" fill-rule="evenodd" d="${d}"/>
  </g>
</svg>
`;
writeFileSync('E:/blogb/public/favicon.svg', favicon);
console.log('favicon written, path len:', d.length);
