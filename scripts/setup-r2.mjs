/**
 * 一次性：建 R2 桶 photos-originals → 开启公共访问 → 上传相册全部原图
 * 前置：$env:CF_TOKEN = "你的 Cloudflare API Token"
 * 用法：node scripts/setup-r2.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { createHmac, createHash } from 'node:crypto';

const TOKEN = process.env.CF_TOKEN || '';
const ACCOUNT = process.env.CF_ACCOUNT || '04a64fea2e28928b0805f650a6783311';
const BUCKET = 'photos-originals';

if (!TOKEN) {
  console.error('缺少 CF_TOKEN');
  process.exit(1);
}

async function api(path, opts = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status} ${JSON.stringify(body).slice(0, 250)}`);
  return body;
}

// ── 1) 建桶（已存在则跳过） ─────────────────────────────────
try {
  const c = await api(`/accounts/${ACCOUNT}/r2/buckets`, {
    method: 'POST',
    body: JSON.stringify({ name: BUCKET }),
  });
  console.log('✅ 桶已创建:', BUCKET);
} catch (e) {
  if (String(e.message).includes('10014') || String(e.message).includes('already exists')) {
    console.log('ℹ️ 桶已存在，复用');
  } else throw e;
}

// ── 2) 开启 r2.dev 公共访问 ─────────────────────────────────
const pub = await api(`/accounts/${ACCOUNT}/r2/buckets/${BUCKET}/domains/managed`, {
  method: 'PUT',
  body: JSON.stringify({ enabled: true }),
});
const publicUrl = `https://${pub.result.domain}`;
console.log('✅ 公共访问已开启:', publicUrl);

// ── 3) 临时 S3 凭据 ─────────────────────────────────────────
const creds = (await api(`/accounts/${ACCOUNT}/r2/temp-access-credentials`, { method: 'POST' })).result;
console.log('✅ 已获取临时上传凭据');

// ── 4) SigV4 上传 ───────────────────────────────────────────
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const hmac = (key, data) => createHmac('sha256', key).update(data).digest();

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.avif': 'image/avif',
};

async function putObject(key, body, contentType) {
  const host = `${ACCOUNT}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const date = amzDate.slice(0, 8);
  const payloadHash = sha256(body);
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  const canonicalUri = `/${encodedKey}`;
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-security-token:${creds.session_token}\n`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date;x-amz-security-token';
  const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const scope = `${date}/auto/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${sha256(canonicalRequest)}`;
  const kDate = hmac(`AWS4${creds.secret_access_key}`, date);
  const kRegion = hmac(kDate, 'auto');
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  const auth = `AWS4-HMAC-SHA256 Credential=${creds.access_key_id}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}${canonicalUri}`, {
    method: 'PUT',
    headers: {
      'content-type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      'x-amz-security-token': creds.session_token,
      Authorization: auth,
    },
    body,
  });
  if (res.status >= 300) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  console.log('  ✅', key);
}

const files = readdirSync('src/assets/gallery').filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
console.log(`上传 ${files.length} 张原图...`);
for (const f of files) {
  const ext = f.slice(f.lastIndexOf('.')).toLowerCase();
  await putObject(f, readFileSync(`src/assets/gallery/${f}`), CONTENT_TYPES[ext] || 'application/octet-stream');
}

console.log('✅ 全部上传完成');
console.log('公共下载地址前缀:', publicUrl);
console.log('请把 site.ts 的 r2Base 设为: ' + publicUrl);
