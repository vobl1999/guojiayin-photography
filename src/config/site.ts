/**
 * ─────────────────────────────────────────────────────────────
 *  站点配置 —— 品牌、SEO、联系方式、社交账号都集中在这里修改
 *  改完保存，推送到 GitHub，Cloudflare Pages 会自动重新构建
 * ─────────────────────────────────────────────────────────────
 */

export const SITE = {
  /* ── 品牌 ─────────────────────────────────────────────── */
  name: 'Guo Jiayin', // 左上角与页脚的署名
  nameZh: '郭嘉胤', // 中文名（用于 SEO：搜中文名也能找到）
  legalName: 'Guo Jiayin', // 版权声明中的名字
  tagline: 'Photography & Journal',
  url: 'https://www.vobl.cn', // ⚠️ 部署后改成你的真实域名

  /* ── SEO ──────────────────────────────────────────────── */
  description:
    'Guo Jiayin (郭嘉胤) — 业余摄影师的个人网站：风景、街头与建筑摄影，以及关于观看的笔记。An amateur photographer\'s quiet corner for photographs and words: landscape, portrait and street photography, plus occasional essays on light.',
  // 社交分享图：已由 scripts/make-og.mjs 从精选照片生成（1200×630）
  ogImage: '/og-default.jpg',

  /* ── 联系方式与社交 ────────────────────────────────────── */
  email: 'gjy@vobl.cn',
  socials: {
    x: { label: 'X', url: 'https://x.com/vobl1999' },
    douyin: { label: '抖音', url: 'https://www.douyin.com/user/MS4wLjABAAAAIHl26glyy12oz6SXxRDgL4Bh18y6Z3jBdQO5FcVzWTM' },
    bilibili: { label: 'Bilibili', url: 'https://space.bilibili.com/1271779116' },
  },

  /* ── 原图下载（R2 存储桶） ────────────────────────────── */
  // 原始照片已上传到 R2 公共桶 photos-originals（更新：node scripts/upload-r2.mjs）
  // 点 Lightbox 下载按钮即可获取原图
  r2Base: 'https://pub-7d773d4fe41a44659b035738f0562d96.r2.dev',

  /* ── 页脚 ─────────────────────────────────────────────── */
  footerNote: 'All photographs are the property of the author.',
  colophon: 'Set in Fraunces & Inter. Built with Astro.',
} as const;
