/**
 * 上传相册原图到 Cloudflare R2 公共存储桶（供网站"下载原图"按钮使用）
 *
 * 认证方式二选一（都通过环境变量传入，勿把 token 贴进对话）：
 *   A. API Token（推荐）：CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
 *   B. R2 S3 密钥：CLOUDFLARE_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY
 *
 * 用法：node scripts/upload-r2.mjs
 * 完成后：把 src/config/site.ts 的 r2Base 填为桶的公共地址（如 https://pub-xxxx.r2.dev）
 */
import { readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const bucket = process.env.R2_BUCKET || 'photos-originals';
const account = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
const access = process.env.R2_ACCESS_KEY_ID || '';
const secret = process.env.R2_SECRET_ACCESS_KEY || '';

if (!account || (!apiToken && (!access || !secret))) {
  console.error(
    '缺少环境变量：CLOUDFLARE_ACCOUNT_ID 以及 CLOUDFLARE_API_TOKEN（或 R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY）'
  );
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
    env: {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: account,
      CLOUDFLARE_API_TOKEN: apiToken,
      R2_ACCESS_KEY_ID: access,
      R2_SECRET_ACCESS_KEY: secret,
    },
  });
}
console.log(`✅ ${files.length} 张原图已上传到桶：${bucket}`);
console.log('接下来把 site.ts 的 r2Base 填为桶的公共地址，例如 https://pub-xxxx.r2.dev');
