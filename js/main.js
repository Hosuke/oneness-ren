import { WORDS } from '../data/words.js';
import { WaterScene, makePaper } from './water.js';
import { WordCard } from './card.js';
import { loadFonts } from './fonts.js';
import { RELATIONS, bilingual, element, original, relationTag, sourceList } from './entries.js';

function renderSources() {
  const body = document.querySelector('#sources-body');
  for (const entry of WORDS) {
    const row = element('tr');
    const values = [original(entry, 'span', 'table-word'), bilingual(entry.langName),
      element('span', 'roman', entry.roman), relationTag(entry.relation),
      bilingual(entry.gloss), sourceList(entry.sources)];
    values[2].lang = 'en';
    for (const value of values) {
      const cell = element('td');
      cell.append(value);
      row.append(cell);
    }
    if (entry.note) row.children[4].append(bilingual(entry.note, 'card-note'));
    body.append(row);
  }
}

function bootScenes() {
  const card = new WordCard();
  const list = document.querySelector('#entry-list');
  for (const entry of WORDS) {
    const li = element('li');
    const button = element('button');
    button.type = 'button';
    const relation = RELATIONS[entry.relation];
    button.append(original(entry), document.createTextNode(` (${entry.langName.en}) — ${relation.zh} · ${relation.en}`));
    button.addEventListener('click', () => card.open(entry, button));
    li.append(button);
    list.append(li);
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // Still = the system preference, or the reader's own choice (WCAG 2.2.2).
  const toggle = document.querySelector('.motion-toggle');
  let chosenStill = null;
  try { chosenStill = JSON.parse(localStorage.getItem('oneness.still')); } catch { /* storage unavailable */ }
  const isStill = () => typeof chosenStill === 'boolean' ? chosenStill : motion.matches;
  const water = new WaterScene(document.querySelector('#water'), {
    words: WORDS, reduced: isStill(),
    onSelect: (entry, invoker, release) => card.open(entry, invoker, release),
  });
  const updateMotion = () => {
    const still = isStill();
    document.documentElement.classList.toggle('is-still', still);
    water.setReducedMotion(still);
    toggle?.setAttribute('aria-pressed', String(still));
  };
  motion.addEventListener('change', () => {
    chosenStill = null;
    try { localStorage.removeItem('oneness.still'); } catch { /* storage unavailable */ }
    updateMotion();
  });
  toggle?.addEventListener('click', event => {
    event.stopPropagation();
    chosenStill = !isStill();
    try { localStorage.setItem('oneness.still', JSON.stringify(chosenStill)); } catch { /* storage unavailable */ }
    updateMotion();
  });
  updateMotion();
}

// One paper for the whole page, so no section edge shows a seam.
document.body.style.backgroundImage = `url("${makePaper()}")`;
document.body.style.backgroundSize = '256px 256px';
if (document.body.dataset.page === 'sources') renderSources();
else bootScenes();
loadFonts(WORDS);
