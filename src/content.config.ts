import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 文章：把 .md 文件放进 src/content/posts/ 即可自动变成博客文章
 * 支持的 frontmatter 字段见下方 schema，样例请看已有的示例文章
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      // 封面图：把图片放在文章旁边，写 cover: ./xxx.jpg
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      lang: z.enum(['en', 'zh']).default('en'),
    }),
});

/**
 * 相册说明（可选）：文件名与 src/assets/gallery/ 里的图片同名，
 * 例如 dune.jpg ↔ dune.md。没有说明文件的图片也会自动展示，
 * 只是没有标题/地点等文字。
 */
const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string().optional(),
    titleZh: z.string().optional(),
    date: z.coerce.date().optional(),
    location: z.string().optional(),
    locationZh: z.string().optional(),
    description: z.string().optional(),
    collection: z.string().optional(), // 用于相册筛选，如 Landscape / Portrait
    collectionZh: z.string().optional(), // 筛选标签的中文名，如 风景
    featured: z.boolean().default(false), // 出现在首页精选作品
    camera: z.string().optional(),
  }),
});

/**
 * 独立页面（如 About 正文）：把 .md 放进 src/content/pages/
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      intro: z.string().optional(),
      // 肖像照：把图片放在同一目录，写 portrait: ./portrait.jpg
      portrait: image().optional(),
      portraitAlt: z.string().optional(),
    }),
});

export const collections = { posts, gallery, pages };
