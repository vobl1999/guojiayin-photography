/**
 * ─────────────────────────────────────────────────────────────
 *  国际化字典 —— 所有界面文字都在这里，中英对照
 *  想改任何文案，改这里即可
 * ─────────────────────────────────────────────────────────────
 */

export type Lang = 'en' | 'zh';

export const languages: Record<Lang, string> = {
  en: 'EN',
  zh: '中文',
};

const en = {
  // Header
  'nav.portfolio': 'Portfolio',
  'nav.journal': 'Journal',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'menu.open': 'Open menu',
  'menu.close': 'Close menu',
  // Home
  'home.title': 'Guo Jiayin 郭嘉胤 — Photography & Journal',
  'home.hello': 'Hello.',
  'hero.kicker': 'Photography · Journal',
  'hero.headline': 'Light, observed with <em>patience</em>.',
  'hero.sub':
    'I make photographs of landscapes, people and passing moments, and keep a small journal of notes on seeing. Take a look around — the portfolio, or the essays.',
  'home.selected': 'Selected Works',
  'home.selectedSub': 'A few recent photographs.',
  'home.selectedCta': 'View the full portfolio',
  'home.latest': 'From the Journal',
  'home.latestSub': 'Notes on seeing.',
  'home.aboutTitle': 'The Amateur Photographer',
  'home.aboutCta': 'More about me',
  'home.coda': 'Photographs, words, and the <em>spaces between</em>.',
  // Gallery
  'gallery.title': 'Portfolio',
  'gallery.intro': 'A selection of photographs. Click any image to view it full-screen.',
  'gallery.all': 'All',
  'gallery.count': '{n} photographs',
  'gallery.close': 'Close',
  'gallery.prev': 'Previous',
  'gallery.next': 'Next',
  // Journal
  'journal.title': 'Journal',
  'journal.intro': 'Notes, field reports and essays on photography.',
  'journal.back': 'Back to the journal',
  'journal.published': 'Published',
  'journal.updated': 'Updated',
  'journal.previous': 'Previous entry',
  'journal.next': 'Next entry',
  'journal.readTime': '{n} min read',
  // About
  'about.title': 'About',
  // Contact
  'contact.title': 'Contact',
  'contact.intro':
    'If you have a project in mind, a collaboration, or simply want to say hello — I would love to hear from you.',
  'contact.emailLabel': 'Email',
  'contact.elsewhere': 'Elsewhere',
  'contact.response': 'I usually reply within a day or two.',
  // 404
  '404.title': 'Nothing here.',
  '404.text': 'The page you are looking for has wandered off.',
  '404.cta': 'Back to home',
  // Footer
  'footer.note': 'All photographs are the property of the author.',
  'footer.colophon': 'Set in Fraunces & Inter. Built with Astro.',
  'footer.rights': 'All rights reserved.',
  'footer.index': 'Index',
  'footer.contact': 'Contact',
  'footer.elsewhere': 'Elsewhere',
};

const zh: Record<keyof typeof en, string> = {
  'nav.portfolio': '作品集',
  'nav.journal': '日志',
  'nav.about': '关于',
  'nav.contact': '联系',
  'menu.open': '打开菜单',
  'menu.close': '关闭菜单',
  'home.hello': '你好。',
  'home.title': '郭嘉胤 Guo Jiayin — 摄影与日志',
  'hero.kicker': '摄影 · 日志',
  'hero.headline': '光线，值得<em>耐心</em>等待。',
  'hero.sub':
    '我拍摄风景、人物与稍纵即逝的瞬间，也在这里写下一些关于观看的笔记。欢迎四处看看——作品集，或者日志。',
  'home.selected': '精选作品',
  'home.selectedSub': '近来的一些照片。',
  'home.selectedCta': '查看全部作品',
  'home.latest': '最新日志',
  'home.latestSub': '关于观看的笔记。',
  'home.aboutTitle': '关于业余摄影师',
  'home.aboutCta': '了解更多',
  'home.coda': '照片、文字，以及其间的<em>留白</em>。',
  'gallery.title': '作品集',
  'gallery.intro': '一些照片的精选。点击任意照片即可全屏查看。',
  'gallery.all': '全部',
  'gallery.count': '{n} 张照片',
  'gallery.close': '关闭',
  'gallery.prev': '上一张',
  'gallery.next': '下一张',
  'journal.title': '日志',
  'journal.intro': '摄影笔记、实地记录与随笔。',
  'journal.back': '返回日志',
  'journal.published': '发布于',
  'journal.updated': '更新于',
  'journal.previous': '上一篇',
  'journal.next': '下一篇',
  'journal.readTime': '{n} 分钟',
  'about.title': '关于',
  'contact.title': '联系',
  'contact.intro': '如果你有拍摄想法、合作邀约，或者只是想打个招呼——我很乐意收到你的来信。',
  'contact.emailLabel': '邮箱',
  'contact.elsewhere': '其他地方',
  'contact.response': '我通常在一两天内回复。',
  '404.title': '这里什么都没有。',
  '404.text': '你寻找的页面已经走丢了。',
  '404.cta': '回到首页',
  'footer.note': '所有照片均为作者版权所有。',
  'footer.colophon': '字体：Fraunces & Inter。由 Astro 构建。',
  'footer.rights': '保留所有权利。',
  'footer.index': '索引',
  'footer.contact': '联系',
  'footer.elsewhere': '更多地方',
};

export const ui = { en, zh } as const;

export type UIKey = keyof typeof en;

/** 取当前语言的文案 */
export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key];
}

/** 支持 {n} 占位插值，如 t('gallery.count').replace('{n}', String(n)) */
export function translate(lang: Lang, key: UIKey, vars?: Record<string, string | number>): string {
  let s = t(lang, key);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

/** 从 URL 中解析当前语言（无前缀视为默认语言 en） */
export function langFromUrl(url: URL): Lang {
  const first = url.pathname.split('/')[1];
  return first === 'zh' ? 'zh' : 'en';
}

/** 切换到另一种语言时对应的路径（en 页面在 /en/，zh 页面在 /zh/） */
export function alternatePath(pathname: string, current: Lang): string {
  const norm = pathname.replace(/\/+$/, '');
  const rest = norm === '' || norm === '/' ? '' : norm.replace(new RegExp(`^/${current}`), '');
  const target = current === 'zh' ? '/en' : '/zh';
  return `${target}${rest}`;
}
