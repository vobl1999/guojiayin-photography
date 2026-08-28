import type { Lang } from '../i18n/ui';

/** 取文件名（兼容 / 与 \） */
export function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

/** 内容条目 id → 文章 slug（去掉扩展名） */
export function slugFromId(id: string): string {
  return basename(id).replace(/\.(md|mdx)$/, '');
}

/** 长日期：April 12, 2025 / 2025年4月12日 */
export function formatDate(date: Date, lang: Lang = 'en'): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** 短日期：Apr 2025 / 2025年4月 */
export function formatDateShort(date: Date, lang: Lang = 'en'): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
  }).format(date);
}

/** 估算阅读时长（中文按字数，英文按词数） */
export function readingTime(body: string, lang: Lang = 'en'): number {
  const text = body.replace(/[#*`>!\[\]()\-_]/g, ' ').replace(/\s+/g, ' ').trim();
  if (lang === 'zh') return Math.max(1, Math.round(text.length / 380));
  return Math.max(1, Math.round(text.split(' ').length / 210));
}
