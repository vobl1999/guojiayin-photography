# 交接卡 CONTEXT.md

> 给未来任何会话的"我"：读完本文件即可无缝接管此项目。最后更新：2026-08-29 晚（含 R2 下载、EdgeOne、模板仓库等全部最新状态）

## 项目概况

- **站点**：Guo Jiayin（郭嘉胤）个人摄影博客，业余摄影师，哈苏 X2D II 100C + XCD 90V
- **域名**：`https://www.vobl.cn`（正式）｜回源/备用：`https://guojiayin-photography.pages.dev`（Cloudflare Pages）
- **GitHub 主站仓库**：`vobl1999/guojiayin-photography`（公开）
- **GitHub 模板仓库**：`vobl1999/Photografy-Blog`（开源模板，另见下方）
- **本地工作区**：`E:\BLOG`（主站）｜`E:\muban`（模板副本，含独立 git）
- **目标用户**：主要在国内

## 分发架构（最新状态：已回到纯 Cloudflare）

```
访客 → Cloudflare（www.vobl.cn 与根域 vobl.cn 均已代理，橙云）
     → Cloudflare Pages（guojiayin-photography.pages.dev）
     → 图片 WebP 走 /_astro/（immutable 缓存）；原图下载走 /downloads/（Pages Functions）
```

- **EdgeOne 已停用/回退**：DNS 实测（2026-08-29 晚）www.vobl.cn 无 CNAME、直接解析到 Cloudflare Anycast IP（104.20.x / 172.66.x）；根域 vobl.cn 同 IP。EdgeOne 的 CNAME（cdn.dnsv1...）已不在解析链上，流量直走 Cloudflare Pages。**若用户重新启用 EdgeOne 需按旧方案再配**（源站 = pages.dev，绝不含 www）
- 备案状态：**未备案**。用户买了一台**腾讯云国内轻量（1 个月）**；腾讯云要求服务器剩余 ≥3 个月才能备案 → 已建议「阿里云 99 元/年」或续费。备案通过后可用 `deploy/nginx.conf` + `deploy/SERVER.md`（国内反代方案，已写好）

## 下载功能 + R2（最新完成）

- **R2 桶**：`photos-originals`（账号 04a64fea2e28928b0805f650a6783311），公共访问 `https://pub-7d773d4fe41a44659b035738f0562d96.r2.dev`，13 张原图已上传
- **site.ts**：`r2Base: 'https://pub-7d773d4fe41a44659b035738f0562d96.r2.dev'`
- **下载入口**：照片卡片右下角 ↓（悬停出现/触摸常显）+ Lightbox 右上角 ↓
- **流程**：点击 → 「禁止商用」弹窗（勾"下次不再提醒"存 localStorage `licence-accepted`）→ 点「好」才下载
- **下载通道**：`functions/downloads/[file].js` —— 同域转发 R2 + `Content-Disposition: attachment`（跨域直链会被浏览器当页面打开，所以必须走这层）。**注意：文件名要先 `decodeURIComponent` 再校验/编码**（空格文件名的 %20 曾导致 404，已修）
- 脚本：`scripts/upload-r2.mjs`（wrangler 上传新原图，需 CLOUDFLARE_API_TOKEN 等环境变量）、`scripts/setup-r2.mjs`（一次性建桶，已用过）
- ⚠️ 用户的 Cloudflare API Token 曾直接贴在对话里（`cfut_...`），我已提醒吊销；**新 token 不要再贴对话**，让用户存环境变量

## 技术栈与架构

- Astro 5（静态输出）+ TypeScript + sharp 图片优化 + fontsource（latin 子集 3 个 woff2）
- **双语**：`/en/…`、`/zh/…`、根 `/` = 英文首页别名；路径手控（`src/i18n/ui.ts`）
- **系统语言检测**：`functions/_middleware.js`（Accept-Language 开头 zh → 302 到 /zh）
- **内容约定**：
  - 照片 → `src/assets/gallery/`；说明 → `src/content/gallery/*.md`（同名；字段 title/titleZh/date/location/collection/featured/order/camera）
  - 相册现状（2026-08-29）：13 张照片，sidecar 已用 EXIF 补齐真实日期+相机（哈苏 X2D 100C · XCD 90V，blog_0004=38V、blog_0010=20-35E）；模板演示时代遗留的 9 个孤儿 sidecar（alpine-night 等）已删除
  - `order` 字段：featured 内的策展顺序（小→大），首页 statement 图 = order 最小的 featured 照片（当前 0001）
  - 文章 → `src/content/posts/*.md`（title/description/date/tags/lang/draft/cover）
  - 关于页 → `src/content/pages/about-en.md` / `about-zh.md`
  - 站点配置 → `src/config/site.ts`（nameZh=郭嘉胤、email=gjy@vobl.cn、X/抖音/Bilibili、brandLogo 可选、r2Base）
  - 界面文案 → `src/i18n/ui.ts`
- **设计**：Fraunces + Inter + 中文系统字体；暗色模式（滑块+日月图标，localStorage `theme-pref`）；首页「你好。/Hello.」霓虹光斑（localStorage `hello-neon-pinned`）；页头哈苏字标（CSS mask，可点跳哈苏官网）
- **性能**：LQIP 模糊渐显、WebP（网格 480/800w q70、Lightbox 1400w q74、首页 1800w q78）、滚动加载（IO rootMargin 640px）、回到顶部按钮、主题化滚动条、字体预加载、`content-visibility`
- **重要**：**ClientRouter 已移除**（用户要求每次进页面完整刷新）；预取关闭；`<Image>` 必须同时给 `width` 和 `widths`（否则 src 回退原图，曾致 2.2MB 全尺寸 bug）
- **安全**：_headers 全套（CSP/HSTS/COOP/CORP 等）；注意 `_headers` 注释只能用 `#`

## 常用命令

```bash
npm run dev / build / preview（--port 4321）
npx astro check
node scripts/sync-github.mjs "提交信息"   # 一键推送（本地提交+API 同步；github.com 被墙，别用 git push）
node scripts/add-photos.mjs              # 新照片自动生成说明（读 EXIF）
node scripts/make-og.mjs                 # 生成分享图
node scripts/make-icons.mjs              # PWA 图标
node scripts/upload-r2.mjs               # 上传原图到 R2（需环境变量）
```

## 重要坑位

1. **github.com:443 被墙**：一律 `node scripts/sync-github.mjs`；本地 git 与远端 sha 不一致正常，别去 git pull/push 对齐
2. 同步脚本偶发网络失败：若"没有改动"但远端没更新 → `git reset --soft HEAD~1` 后重跑
3. PowerShell 控制台显示中文乱码是 GBK 显示问题，文件本身 UTF-8
4. 预览服务器后台 job 常挂，重启：`npm run preview -- --port 4321`
5. **Astro `<script define:vars>` 会输出未编译 TS 进 HTML**（曾全站脚本崩）——用 data 属性传值代替
6. 跨域下载必须走 `/downloads/` 同域通道
7. `_redirects` 当前为空；微信验证文件 `public/6776...txt` 已部署
8. 本地验证注意：PowerShell 的 `-match` 中文和空字符串转义易踩坑；直接读 `dist\` 文件验证更稳

## 模板仓库（Photografy-Blog）

- `E:\muban`：通用化模板（个人信息已清空、配置全可改、README 中文教程含作者 vobl + 求 Star），本地 git 已关联 `vobl1999/Photografy-Blog`（当前单提交 fdb75cd，工作区干净）
- 主站新增功能（下载/R2）**尚未同步到模板**——实测 muban 只有 `functions/_middleware.js`，缺 `functions/downloads/[file].js`、`r2Base` 配置、下载按钮/授权弹窗、`scripts/upload-r2.mjs`；用户提过可同步，待办

## 待办 / 未来方向

1. Google Search Console + Bing 提交 sitemap（用户自行操作）
2. 备案（阿里 99/年 或腾讯续 3 个月）→ 通过后接国内加速（deploy/ 里已备好 nginx 方案）
3. 可选：把 R2 下载功能同步到模板仓库；给 13 张照片起正式标题（现在 blog_0004 等占位名）；照片系列分类（collection 数据）
4. 若用户想重新上 EdgeOne：按旧方案把 www CNAME 指回 EdgeOne 地址、源站填 pages.dev
