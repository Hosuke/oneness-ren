// Shared rendering keeps the card, keyboard list and source table consistent.
export const RELATIONS = {
  self: { zh: '本字', en: 'the character itself' },
  translation: { zh: '對譯', en: 'translation of 仁' },
  neighbour: { zh: '近義', en: 'neighbouring idea' },
};

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function original(entry, tag = 'span', className = '') {
  const node = element(tag, className, entry.text);
  node.lang = entry.lang;
  node.dir = entry.dir;
  return node;
}

export function bilingual(value, className = '') {
  const block = element('div', className);
  const zh = element('span', 'zh', value.zh);
  zh.lang = 'zh-Hant';
  const en = element('span', 'en', value.en);
  en.lang = 'en';
  block.append(zh, en);
  return block;
}

export function relationTag(relation) {
  const value = RELATIONS[relation];
  const tag = element('span', 'relation-tag');
  const en = element('span', 'en', value.en);
  en.lang = 'en';
  tag.append(document.createTextNode(`${value.zh} · `), en);
  return tag;
}

export function sourceList(sources) {
  const list = element('ul', 'source-list');
  for (const source of sources) {
    const item = element('li');
    const title = element(source.url ? 'a' : 'span', '', source.title);
    title.dir = 'auto';
    if (source.url) {
      title.href = source.url;
      title.target = '_blank';
      title.rel = 'noopener';
    }
    item.append(title);
    if (source.quote) {
      const quote = element('q', 'source-quote', source.quote);
      quote.dir = 'auto';
      // CJK is never slanted: italic belongs to Latin script only.
      if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(source.quote)) quote.classList.add('q-cjk');
      item.append(quote);
    }
    list.append(item);
  }
  return list;
}
