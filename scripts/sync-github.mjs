/**
 * 一键推送：自动检测本地改动（新增/修改/删除），
 * 1) 本地 git 提交  2) 通过 api.github.com 同步到 GitHub（github.com 被墙时也能用）
 * 用法：node scripts/sync-github.mjs ["提交信息"]
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const OWNER = 'vobl1999';
const REPO = 'guojiayin-photography';
const BRANCH = 'main';
const MSG = process.argv[2] || 'sync: update site content';

// ── 1) 检测改动（-z 避免文件名带空格被转义） ─────────────────
const status = execSync('git status --porcelain -z', { encoding: 'utf8' });
const parts = status.split('\0').filter(Boolean);
const ADDED = [];
const MODIFIED = [];
const DELETED = [];
for (const part of parts) {
  const flag = part.slice(0, 2);
  const path = part.slice(3);
  if (flag.includes('?') || flag.startsWith('A')) ADDED.push(path);
  else if (flag.startsWith('D')) DELETED.push(path);
  else if (flag.includes('M') || flag.includes('R')) MODIFIED.push(path);
}
console.log(`改动：新增 ${ADDED.length}，修改 ${MODIFIED.length}，删除 ${DELETED.length}`);

if (ADDED.length + MODIFIED.length + DELETED.length === 0) {
  console.log('没有改动，无需推送。');
  process.exit(0);
}

// ── 2) 本地提交 ─────────────────────────────────────────────
try {
  execSync('git add -A', { stdio: 'ignore' });
  execSync(`git commit -m "${MSG.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });
  console.log('✅ 本地已提交:', MSG);
} catch {
  console.log('本地提交跳过（可能无改动）');
}

// ── 3) API 同步 ─────────────────────────────────────────────
const cred = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8',
});
const token = cred.split('\n').find((l) => l.startsWith('password=')).replace('password=', '');

const api = async (path, opts = {}) => {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'dsh-sync',
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status} ${JSON.stringify(body).slice(0, 200)}`);
  return body;
};

const head = await api(`/git/refs/heads/${BRANCH}`);
const headSha = head.object.sha;
const commit = await api(`/git/commits/${headSha}`);
const baseTree = commit.tree.sha;

const map = new Map();
for (const p of [...MODIFIED, ...ADDED]) {
  const blob = await api('/git/blobs', {
    method: 'POST',
    body: JSON.stringify({ content: readFileSync(p).toString('base64'), encoding: 'base64' }),
  });
  map.set(p, { sha: blob.sha, mode: '100644' });
  console.log(`blob ${p} -> ${blob.sha.slice(0, 7)}`);
}

const treeEntries = [...MODIFIED, ...ADDED].map((p) => ({ path: p, ...map.get(p), type: 'blob' }));
for (const p of DELETED) treeEntries.push({ path: p, mode: '100644', type: 'blob', sha: null });

const newTree = await api('/git/trees', {
  method: 'POST',
  body: JSON.stringify({ base_tree: baseTree, tree: treeEntries }),
});
const newCommit = await api('/git/commits', {
  method: 'POST',
  body: JSON.stringify({
    message: MSG,
    tree: newTree.sha,
    parents: [headSha],
    author: { name: 'vobl1999', email: 'maimaidx@hotmail.com' },
    committer: { name: 'vobl1999', email: 'maimaidx@hotmail.com' },
  }),
});
await api(`/git/refs/heads/${BRANCH}`, {
  method: 'PATCH',
  body: JSON.stringify({ sha: newCommit.sha, force: false }),
});
console.log('✅ 远端 main 已更新:', newCommit.sha.slice(0, 7));
