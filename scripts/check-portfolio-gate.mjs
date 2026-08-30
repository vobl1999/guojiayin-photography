// 验证远端仓库不再有 .gate-secret，并全链路验证主站大门
import { execSync } from 'node:child_process';

const cred = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8',
});
const token = cred.split('\n').find((l) => l.startsWith('password=')).replace('password=', '');

const B = 'https://guojiayin-photography.pages.dev';
(async () => {
  // 1) 远端仓库审计
  const tree = await (
    await fetch('https://api.github.com/repos/vobl1999/guojiayin-photography/git/trees/main?recursive=1', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'audit' },
    })
  ).json();
  const leaked = (tree.tree || []).filter((t) => /gate-secret|dev\.vars|audit-key/.test(t.path));
  console.log('remote secret files:', leaked.length === 0 ? '无 ✓' : leaked.map((t) => t.path).join(', '));

  // 2) 无 Cookie 页面 → 302 到 gate.html
  const home = await fetch(B + '/', { redirect: 'manual', headers: { accept: 'text/html' } });
  console.log('home no-cookie:', home.status, '->', home.headers.get('location'));

  // 3) gate 页 + 组件
  const gate = await (await fetch(B + '/gate.html')).text();
  console.log('gate page:', gate.includes('cf-turnstile'), '| sitekey ok:', gate.includes('0x4AAAAAAEiACKAD2IxsS8OL'));

  // 4) 爬虫放行 + 资源放行
  const crawler = await fetch(B + '/', { redirect: 'manual', headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } });
  console.log('googlebot:', crawler.status);
  const favicon = await fetch(B + '/favicon.svg');
  console.log('favicon:', favicon.status);

  // 5) 假 token → 400
  const bad = await fetch(B + '/api/gate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cfToken: 'x' }) });
  console.log('api/gate bad token:', bad.status);

  // 6) 语言检测仍正常（带通行 cookie 的 zh 用户 → /zh）
  const zh = await fetch(B + '/', {
    redirect: 'manual',
    headers: { accept: 'text/html', 'accept-language': 'zh-CN,zh;q=0.9', cookie: 'vobl_gate=dummy' },
  });
  console.log('zh lang detect (invalid gate cookie):', zh.status, '->', zh.headers.get('location'));
})();
