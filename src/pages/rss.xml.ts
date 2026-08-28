import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site';
import { slugFromId } from '../lib/utils';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: `${SITE.name} — Journal`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${post.data.lang === 'zh' ? '/zh' : '/en'}/journal/${slugFromId(post.id)}`,
    })),
  });
}
