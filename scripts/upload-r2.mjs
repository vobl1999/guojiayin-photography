/**
 * 上传相册原图到 Cloudflare R2 公共存储桶（供网站"下载原图"按钮使用）
 *
 * 前置准备：
 *   1. Cloudflare 控制台 → R2 → 创建桶（如 photos-originals）→ 设为公共访问（r2.dev 域名）
 *   2. R2 → 管理 R2 API 令牌 → 创建（读取+写入权限），记下 Access Key ID / Secret
 *
 * 环境变量（PowerShell 示例）：
 *   $env:CLOUDFLARE_ACCOUNT_ID="你的账户ID"
 *   $env:R2_ACCESS_KEY_ID="你的key"
 *   $env:R2_SECRET_ACCESS_KEY="你的secret"
 *   $env:R2_BUCKET="photos-originals"
 *
 * 用法：node scripts/upload-r2.mjs
 * 完成后：把 src/config/site.ts 的 r2Base 填为桶的公共地址（如 https://pub-xxxx.r2.dev）
 */
import { readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const bucket = process.env.R2_BUCKET || 'photos-originals';
const account = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const access = process.env.R2_ACCESS_KEY_ID || '';
const secret = process.env.R2_SECRET_ACCESS_KEY || '';

if (!account || !access || !secret) {
  console.error('缺少环境变量：CLOUDFLARE_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY');
  process.exit(1);
}

const files = readdirSync('src/assets/gallery').filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
if (!files.length) {
  console.log('相册里没有照片。');
  process.exit(0);
}

for (const f of files) {
  console.log(`上传 ${f} ...`);
  execSync(`npx wrangler r2 object put "${bucket}/${f}" --file "src/assets/gallery/${f}" --remote`, {
    stdio: 'inherit',
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: account, R2_ACCESS_KEY_ID: access, R2_SECRET_ACCESS_KEY: secret },
  });
}
console.log(`✅ ${files.length} 张原图已上传到桶：${bucket}`);
console.log('接下来把 site.ts 的 r2Base 填为桶的公共地址，例如 https://pub-xxxx.r2.dev');
