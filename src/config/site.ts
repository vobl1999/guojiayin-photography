/**
 * ─────────────────────────────────────────────────────────────
 *  站点配置 —— 品牌、SEO、联系方式、社交账号都集中在这里修改
 *  改完保存，推送到 GitHub，Cloudflare Pages 会自动重新构建
 * ─────────────────────────────────────────────────────────────
 */

export const SITE = {
  /* ── 品牌 ─────────────────────────────────────────────── */
  name: 'Guo Jiayin', // 左上角与页脚的署名
  legalName: 'Guo Jiayin', // 版权声明中的名字
  tagline: 'Photography & Journal',
  url: 'https://www.vobl.cn', // ⚠️ 部署后改成你的真实域名

  /* ── SEO ──────────────────────────────────────────────── */
  description:
    "Guo Jiayin — an amateur photographer's quiet corner for photographs and words: landscape, portrait and street photography, plus occasional essays on light.",
  // 社交分享图：把一张 1200×630 的 jpg 放到 public/og-default.jpg 即可启用，
  // 留空则不输出 og:image
  ogImage: '',

  /* ── 联系方式与社交 ────────────────────────────────────── */
  email: 'gjy@vobl.cn',
  socials: {
    x: { label: 'X', url: 'https://x.com/vobl1999' },
    douyin: { label: '抖音', url: 'https://www.douyin.com/user/MS4wLjABAAAAIHl26glyy12oz6SXxRDgL4Bh18y6Z3jBdQO5FcVzWTM' },
    bilibili: { label: 'Bilibili', url: 'https://space.bilibili.com/1271779116' },
  },

  /* ── 页脚 ─────────────────────────────────────────────── */
  footerNote: 'All photographs are the property of the author.',
  colophon: 'Set in Fraunces & Inter. Built with Astro.',
} as const;
