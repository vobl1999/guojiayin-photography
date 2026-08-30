// 紧急清理：删除远端 .gate-secret（误推）
import { execSync } from 'node:child_process';

const cred = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8',
});
const token = cred.split('\n').find((l) => l.startsWith('password=')).replace('password=', '');

(async () => {
  const tree = await (
    await fetch('https://api.github.com/repos/vobl1999/guojiayin-photography/git/trees/main?recursive=1', {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'fix' },
    })
  ).json();
  const hit = (tree.tree || []).find((t) => t.path === '.gate-secret');
  if (!hit) {
    console.log('remote .gate-secret not found');
    return;
  }
  const r = await fetch('https://api.github.com/repos/vobl1999/guojiayin-photography/contents/.gate-secret', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'fix', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'chore: remove leaked gate secret (rotation required)', sha: hit.sha }),
  });
  const j = await r.json();
  console.log('delete:', r.status, j.commit ? `ok ${j.commit.sha.slice(0, 7)}` : JSON.stringify(j).slice(0, 200));
})();
