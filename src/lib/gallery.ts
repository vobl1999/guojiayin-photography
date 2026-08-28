import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/ui';
import { basename } from './utils';

/**
 * 相册数据源：
 *  1. 图片放在 src/assets/gallery/ 里（jpg / jpeg / png / webp / avif / gif）
 *  2. 想要标题/地点等说明，就在 src/content/gallery/ 放同名 .md 说明文件
 *     （例如 dune.jpg ↔ dune.md）。没有说明文件的图片也会自动展示。
 */

const imageGlob = import.meta.glob<ImageMetadata>(
  '/src/assets/gallery/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}',
  { eager: true, import: 'default' }
);

export interface Photo {
  src: ImageMetadata;
  filename: string;
  base: string;
  title: string;
  date?: Date;
  location?: string;
  description?: string;
  collection?: string;
  collectionZh?: string;
  featured: boolean;
  camera?: string;
}

function toTitle(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function getAllPhotos(lang: Lang = 'en'): Promise<Photo[]> {
  const sidecars = await getCollection('gallery');
  const photos: Photo[] = [];

  for (const [path, img] of Object.entries(imageGlob)) {
    const filename = path.split('/').pop()!;
    const base = filename.replace(/\.[^.]+$/, '');
    const meta = sidecars.find(
      (s) => basename(s.id).replace(/\.(md|mdx)$/, '').toLowerCase() === base.toLowerCase()
    );
    const d = meta?.data;

    photos.push({
      src: img,
      filename,
      base,
      title: lang === 'zh' && d?.titleZh ? d.titleZh : d?.title ?? toTitle(base),
      date: d?.date,
      location: lang === 'zh' && d?.locationZh ? d.locationZh : d?.location,
      description: d?.description,
      collection: d?.collection,
      collectionZh: d?.collectionZh,
      featured: d?.featured ?? false,
      camera: d?.camera,
    });
  }

  // 有日期的按日期新→旧，无日期的按文件名倒序
  photos.sort(
    (a, b) =>
      (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) ||
      b.filename.localeCompare(a.filename)
  );
  return photos;
}

/** 首页精选：优先 featured 标记，否则取最新前 n 张 */
export async function getFeaturedPhotos(lang: Lang = 'en', n = 4): Promise<Photo[]> {
  const all = await getAllPhotos(lang);
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, n);
}
