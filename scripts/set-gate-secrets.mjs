// 给主站 Pages 项目（guojiayin-photography）设置大门密钥
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';

const T = process.env.CLOUDFLARE_API_TOKEN || '';
const A = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const env = { ...process.env, CLOUDFLARE_API_TOKEN: T, CLOUDFLARE_ACCOUNT_ID: A };

const gateSecret = crypto.randomBytes(32).toString('hex');
const turnstileSecret = process.env.CF_SECRET || ''; // 与博客共用同一个 Turnstile secret

for (const [name, value] of [
  ['GATE_SECRET', gateSecret],
  ['TURNSTILE_SECRET', turnstileSecret],
]) {
  if (!value) {
    console.log(`${name} 缺少值，跳过`);
    continue;
  }
  execSync(`npx wrangler pages secret put ${name} --project-name guojiayin-photography`, {
    input: value + '\n',
    stdio: ['pipe', 'pipe', 'pipe'],
    env,
  });
  console.log(`✓ ${name} 已设置（主站）`);
}
