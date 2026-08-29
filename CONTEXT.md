# 交接卡 CONTEXT.md

> 给未来任何会话的"我"：读完本文件即可无缝接管此项目。最后更新：2026-08-29

## 项目概况

- **站点**：Guo Jiayin（郭嘉胤）个人摄影博客，业余摄影师，哈苏 X2D II 100C + XCD 90V
- **域名**：https://www.vobl.cn（正式），备用 https://guojiayin-photography.pages.dev
- **托管**：Cloudflare Pages（连 GitHub 自动构建部署；构建命令 `npm run build`，输出目录 `dist`，Node 22）
- **GitHub 仓库**：`vobl1999/guojiayin-photography`（公开）
- **本地工作区**：`E:\BLOG`
- **目标用户**：主要在国内（速度优化与备案是长期议题）

## 技术栈与架构

- Astro 5（静态输出）+ TypeScript + sharp 图片优化 + fontsource（已精简为 latin 子集，3 个 woff2）
- **双语**：`/en/…` 英文、`/zh/…` 中文、根路径 `/` = 英文首页别名。无 Astro i18n 中间件，路径全部手控（`src/i18n/ui.ts`）
- **系统语言检测**：`functions/_middleware.js`（Cloudflare Pages 边缘函数，Accept-Language 开头 zh → 302 到 /zh）
- **内容约定**：
  - 照片 → `src/assets/gallery/`（jpg/png/webp），自动出现在相册
  - 照片说明（可选）→ `src/content/gallery/*.md`（与照片同名；字段 title/titleZh/date/location/collection/featured/camera）
  - 文章 → `src/content/posts/*.md`（frontmatter: title/description/date/tags/lang/draft/cover）
  - 关于页 → `src/content/pages/about-en.md` / `about-zh.md`
  - 站点品牌/域名/社交 → `src/config/site.ts`（nameZh=郭嘉胤，email=gjy@vobl.cn，X/抖音/Bilibili 链接）
  - 界面文案 → `src/i18n/ui.ts`
- **设计系统**：Fraunces 衬线 + Inter 无衬线 + 中文系统字体回退；暖纸色 + 墨色 + 古铜金；暗色模式（`data-theme`，滑块+日月图标，localStorage 'theme-vobl'）；首页「你好。/Hello.」霓虹光斑（localStorage 'hello-neon-pinned'）；页头官方哈苏字标（CSS mask，public/hasselblad-mark.svg）
- **性能**：LQIP 模糊占位渐显、WebP、图片滚动加载（IntersectionObserver rootMargin 640px）、HTML 边缘缓存（_headers，Pages 部署自动清缓存）、ClientRouter 页面过渡、**预取已关闭**（用户要求点哪页只加载哪页）
- **安全**：_headers 含 CSP/HSTS/COOP/CORP 等全套响应头

## 常用命令

```bash
npm run dev        # 开发（注意 4321 端口可能被 preview 占用）
npm run build      # 构建到 dist/
npm run preview    # 本地预览（--port 4321）
npx astro check    # 类型检查
node scripts/sync-github.mjs "提交信息"   # 一键推送：本地提交 + API 同步（github.com 被墙时也用这个，别用 git push）
node scripts/add-photos.mjs              # 扫描新照片自动生成说明文件（读 EXIF）
node scripts/make-og.mjs                # 重新生成社交分享图
```

## 重要事项 / 坑

- **github.com:443 直连被墙**：git push 会失败；一律用 `node scripts/sync-github.mjs`（走 api.github.com）。本地 git 与远端 sha 不一致是正常现象，内容一致即可，不要用 git pull/push 去"对齐"
- 本地测试时的中文乱码显示是 PowerShell 控制台 GBK 显示问题，文件本身是 UTF-8，别误判
- 预览服务器是后台 job（pwsh-1），挂掉就 `npm run preview -- --port 4321` 重启
- `_headers` 注释必须用 `#`（不是 /* */）；`_redirects` 当前为空（根路径已有真实页面）
- 微信公众平台域名验证文件已部署：`public/6776ba54c36e226caa45ba0380aa0403.txt`
- 备案状态：**未备案**（用户暂不办）。未来加速路线：免费试用服务器备案 → 腾讯云 EdgeOne Pages（全球模式免备案可先行）

## 待办 / 未来方向

1. Google Search Console + Bing 提交 sitemap（`https://www.vobl.cn/sitemap-index.xml`）——用户需自行操作
2. 备案 + EdgeOne 国内加速（用户自行决策）
3. 可能的迭代：照片系列分类（collection 字段已有，配了数据就出筛选按钮）、隐藏小游戏彩蛋、COS 图床分离
