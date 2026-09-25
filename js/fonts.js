// One CSS2 request per family, containing only the scripts actually used.
const unique = text => [...new Set([...text])].join('');
const strings = value => typeof value === 'string' ? value
  : value && typeof value === 'object' ? Object.values(value).map(strings).join(' ') : '';

function loadFamily(family, text, axes = '') {
  const id = `font-${family.toLowerCase().replaceAll(' ', '-')}`;
  if (document.getElementById(id) || text === '') return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  const url = new URL('https://fonts.googleapis.com/css2');
  url.searchParams.set('family', family + axes);
  url.searchParams.set('display', 'swap');
  if (text !== undefined) url.searchParams.set('text', unique(text));
  link.href = url.href;
  document.head.append(link);
}

export function loadFonts(words) {
  const all = `${document.body.textContent} ${strings(words)} 仁亻二`;
  loadFamily('LXGW WenKai TC', (all.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Bopomofo}\u3000-\u303f\uff00-\uffef]/gu) || []).join(''));
  loadFamily('Cormorant Garamond', undefined, ':ital,wght@0,400;0,500;0,600;1,400;1,500;1,600');
  const scripts = [
    ['Noto Serif Devanagari', /\p{Script=Devanagari}/u],
    ['Noto Serif Tibetan', /\p{Script=Tibetan}/u],
    ['Noto Naskh Arabic', /\p{Script=Arabic}/u],
    ['Noto Serif Hebrew', /\p{Script=Hebrew}/u],
    ['Noto Serif KR', /\p{Script=Hangul}/u],
  ];
  for (const [family, script] of scripts) {
    // Keep complete entries: combining marks and shaping controls matter.
    const used = words.filter(word => script.test(word.text)).map(word => word.text).join('');
    if (used) loadFamily(family, used);
  }
  const needsNoto = /[\p{Script=Greek}\p{Script=Cyrillic}\u0100-\u024f\u1e00-\u1eff]/u;
  const noto = words.filter(word => needsNoto.test(`${word.text} ${word.roman}`)
    || /^vi(?:-|$)/.test(word.lang)).map(word => `${word.text} ${word.roman}`).join(' ');
  if (noto) loadFamily('Noto Serif', noto);
}
