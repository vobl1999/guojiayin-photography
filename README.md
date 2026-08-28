# Guo Jiayin — 业余摄影师个人网站

一套高级感摄影博客 + 相册集，中英双语，基于 **Astro 5** 构建，**部署在 Cloudflare Pages**，源码托管在 **GitHub**。

特点：

- 🖼️ **相册集**：把照片丢进文件夹就自动展示，支持全屏 Lightbox、左右键切换、触摸滑动、按系列筛选
- ✍️ **博客日志**：Markdown 写作，自动生成列表、阅读时长、标签、上一篇/下一篇、RSS
- 🌐 **中英双语**：自动检测系统语言——中文环境进入自动显示中文版，其他语言显示英文版；右上角可一键切换（`/en/` 英文、`/zh/` 中文），文章可分别用中英文写
- 🎨 **高级设计**：Fraunces 衬线标题 + Inter 无衬线 UI，暖纸色调，滚动渐显，胶片颗粒质感
- ⚡ **性能**：图片自动压缩（sharp）、多尺寸响应式、懒加载、永久缓存
- 🔍 **SEO**：sitemap、robots、Open Graph、RSS、404 页齐全

---

## 一、本地开发

需要 Node.js 18.17 以上（推荐 20 或 22）。

```bash
npm install
npm run dev        # 打开 http://localhost:4321
npm run build      # 构建到 dist/
npm run preview    # 本地预览构建结果
```

---

## 二、目录结构与「怎么改内容」

日常更新**只需要碰下面几个文件夹**，其余代码不用动。

```
src/
├── assets/gallery/     ← ① 相册照片：直接丢 jpg/png/webp 进来
├── content/
│   ├── gallery/        ← ② 相册说明（可选）：与照片同名的 .md 文件
│   ├── posts/          ← ③ 博客文章：Markdown，丢进来即成文章
│   └── pages/          ← ④ 关于页正文（about-en.md / about-zh.md）
├── config/site.ts      ← ⑤ 品牌名、邮箱、社交链接、域名等
└── i18n/ui.ts          ← ⑥ 所有界面文字（中英对照）
```

### ① 加照片

把照片放进 `src/assets/gallery/`，推送到 GitHub，自动上线。

- 支持 `jpg / jpeg / png / webp / avif / gif`
- 建议竖图、横图混排都可以，展示区会按 4:5 裁切，全屏时看原图
- 文件名即默认标题（`mountain-dusk.jpg` → “Mountain Dusk”）
- 删除照片 = 删除文件；**不需要清缓存**，每次部署都会重新生成

### ② 给照片加标题/地点/系列（可选）

在 `src/content/gallery/` 建一个**与照片同名的 .md 文件**，例如：

```markdown
---
title: Mountain Dusk        # 英文标题
titleZh: 山暮               # 中文标题（可选）
date: 2025-01-18
location: Alps, Austria     # 英文地点
locationZh: 奥地利 · 阿尔卑斯 # 中文地点（可选）
collection: Landscape       # 系列名（用于相册页筛选）
collectionZh: 风景           # 系列中文名（可选）
featured: true              # true 则出现在首页「精选作品」
camera: Fujifilm X-T5       # 拍摄器材（可选）
---
```

没有说明文件的照片也会正常显示。

### ③ 写文章

在 `src/content/posts/` 新建 `.md` 文件，frontmatter：

```markdown
---
title: 文章标题
description: 一句话摘要（列表页和 SEO 用）
date: 2025-04-12
cover: ./cover.jpg        # 可选：把封面图放在文章旁边，引用它
coverAlt: 封面图描述
tags: [随笔, 风景]
lang: zh                  # en 或 zh —— 决定显示在英文还是中文日志里
featured: false
draft: false              # true 则暂不发布
---

正文用 Markdown 写，支持标题、引用、列表、图片、代码。
```

- 英文文章 `lang: en` 显示在 `/en/journal`，中文文章显示在 `/zh/journal`
- 想写双语文章就写两个文件，各设自己的 lang

### ④ 关于页

编辑 `src/content/pages/about-en.md` 和 `about-zh.md` 的正文。
想加肖像照：把照片（建议 3:4）放进 `src/content/pages/`，在 frontmatter 里加两行：

```markdown
portrait: ./portrait.jpg
portraitAlt: 肖像描述
```

### ⑤ 站点配置

`src/config/site.ts`：品牌名、版权名、域名、邮箱、Instagram/Flickr/X 链接。
社交分享图：把一张 **1200×630** 的 jpg 放到 `public/og-default.jpg`，分享卡片就会带图（没有也没关系，只是不输出 og:image）。
改完推上去就生效。

### ⑥ 界面文字

`src/i18n/ui.ts` 里中英对照，想改任何文案都在这里。

---

## 三、部署到 Cloudflare Pages（推荐方式）

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "feat: photography site"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
```

### 2. 连接 Cloudflare Pages

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选中你的仓库
3. 构建配置：
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js 版本：** 选 20 或 22
4. 点击 **Save and Deploy**，等一两分钟，`https://xxx.pages.dev` 就上线了
5. 绑定自己的域名 `www.vobl.cn`：Pages 项目 → **Custom domains** → 添加域名，按提示把 DNS 里的 www 记录改成 CNAME 指向 `xxx.pages.dev` 即可（vobl.cn 已在 Cloudflare 托管，点一下自动配置）

之后每次 `git push` 都会自动重新构建部署。

### 3. 把域名改成自己的

部署成功后，把 `src/config/site.ts` 里的 `url` 改成你的真实域名（如 `https://jiayin.photo`），重新推送一次。

> ⚠️ 不改 `url` 的话，sitemap / RSS / 分享卡片里的链接会指向占位域名。

### 4. 自定义域名（可选）

在 Pages 项目 → **Custom domains** 添加域名，按提示在 DNS 里加一条 CNAME 记录即可，Cloudflare 会自动配好 HTTPS。

---

## 四、其他部署方式

- **Wrangler CLI：** `npx wrangler login` 后 `npx wrangler pages deploy dist --project-name=guojiayin`
- **GitHub Actions：** 已附 `.github/workflows/deploy.yml`（需配置 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 两个 Secrets），推荐直接用面板集成，更省事

---

## 五、日常内容维护

- **相册**：照片放在 `src/assets/gallery/`，说明文件在 `src/content/gallery/*.md`（与照片同名，自动配对）
- **日志**：`src/content/posts/` 目前有索尼 2026 摄影大赛的参赛说明（`sony-2026-awards.md` 英文、`sony-2026-zh.md` 中文），需要时直接改或新增
- **关于页**：`src/content/pages/about-en.md` / `about-zh.md`
- 肖像照 → `src/content/pages/`（并在关于页 frontmatter 里引用）
- 社交分享图 → `public/og-default.jpg`（可选）

相册为空时页面会显示一句提示，构建完全正常。

---

## 六、常见问题

**照片显示很糊？** 原图建议宽度 ≥ 1600px，竖图 4:5（如 1600×2000）。太小的图会被放大裁切。

**中文标题字体？** 中文用系统宋体（Songti/SimSun）优雅回退，无需下载字体文件。想用思源宋体可在 `global.css` 的 `--serif` 里加 `'Noto Serif SC'` 并自行引入。

**想换强调色？** `src/styles/global.css` 顶部 `--gold` 一个变量即可全局替换。

**文章封面怎么加？** 把图片放到文章同目录，frontmatter 写 `cover: ./cover.jpg`。

**为什么图片永久缓存也不怕？** 优化后的图片文件名带内容哈希，更新后 URL 变化，旧缓存自动失效。

---

## 上线清单（部署后逐项检查）

1. **Cloudflare Pages 连接仓库**：Workers & Pages → Create → Pages → Connect to Git → `guojiayin-photography` → Framework **Astro**、输出目录 `dist`、Node **22** → Deploy
2. **绑定域名**：Custom domains → 添加 `www.vobl.cn`（CNAME 指向 `xxx.pages.dev`，记得删掉旧的 www A 记录）
3. **验证访问**：`https://www.vobl.cn` 打开英文首页；中文系统浏览器应自动跳到 `/zh`（系统语言检测由边缘函数实现）
4. **提交收录**：
   - Google Search Console（DNS TXT 验证）→ 提交 `https://www.vobl.cn/sitemap-index.xml` → 网址检查请求收录
   - Bing Webmaster Tools（可从 GSC 一键导入）→ 提交同一 sitemap
5. **搜一下自己**：等 1–4 周后搜「郭嘉胤」「Guo Jiayin」验证收录

---

## 技术栈

Astro 5 · TypeScript · Fraunces & Inter (fontsource 自托管) · sharp 图片优化 · Cloudflare Pages · 无任何运行时依赖的轻量 JS
