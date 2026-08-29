import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config/site';

// https://astro.build/config
export default defineConfig({
  // 站点地址：部署后改为你的真实域名（sitemap / RSS / OG 依赖它）
  site: SITE.url,
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      // 首页的正式地址是 /en 与 /zh，根路径 / 只是 /en 的别名，不进 sitemap
      filter: (page) => !page.endsWith('/en'),
    }),
  ],
  // 中英双语路径完全由我们自己控制（不需要 Astro 的 i18n 中间件）：
  //   /      → 英文首页（别名）   /en/…  → 英文    /zh/… → 中文
  image: {
    // 使用 sharp 做图片优化（自动压缩、生成多尺寸）
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  markdown: {
    shikiConfig: { theme: 'github-light' },
    // 给文章标题自动加 id（配合目录跳转）
    rehypePlugins: ['rehype-slug'],
  },
});
