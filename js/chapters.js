import { REN_PERSON, REN_TWO, REN_VIEWBOX } from './glyph.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const ease = value => value * value * (3 - 2 * value);
const mix = (from, to, amount) => from + (to - from) * amount;

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  return element;
}

function personAndTwo(container) {
  const [left, top, width, height] = REN_VIEWBOX.trim().split(/[\s,]+/).map(Number);
  const svg = svgElement('svg', {
    viewBox: `${left - width * 0.42} ${top - height * 0.17} ${width * 1.84} ${height * 1.34}`,
    class: 'chapter-svg ren-components',
    'aria-hidden': 'true',
  });
  const person = svgElement('path', { d: REN_PERSON, fill: 'currentColor' });
  const two = svgElement('path', { d: REN_TWO, fill: 'currentColor' });
  svg.append(person, two);
  container.append(svg);
  return {
    render(progress, reduced) {
      const remaining = reduced ? 0 : 1 - ease(progress);
      person.setAttribute('transform', `translate(${-width * 0.35 * remaining} 0)`);
      two.setAttribute('transform', `translate(${width * 0.35 * remaining} 0)`);
    },
    resize() {},
    destroy() { svg.remove(); },
  };
}

function pilgrimFigure(opacity) {
  const figure = svgElement('g', {
    opacity,
    fill: 'currentColor',
    stroke: 'currentColor',
    'stroke-width': 1.45,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  figure.append(
    svgElement('path', { d: 'M-7-13 0-20 8-13Z', 'stroke-width': 0.7 }),
    svgElement('circle', { cx: 0, cy: -9, r: 2.6, stroke: 'none' }),
    svgElement('path', { d: 'M0-5 -1 5 M-1-2 6 0 M-1 5 -5 12 M-1 5 3 12 M7-4 7 13', fill: 'none' }),
  );
  return figure;
}

function henroLoop(container) {
  const svg = svgElement('svg', {
    viewBox: '0 0 500 500',
    class: 'chapter-svg henro-loop',
    'aria-hidden': 'true',
  });
  // An abstract closed circuit: not a geographic map or a prescribed route.
  const path = svgElement('path', {
    d: 'M388 184 C414 220 405 246 421 277 C439 315 391 331 363 349 C337 365 303 350 278 363 C239 385 211 354 181 356 C148 360 129 333 96 324 C66 315 67 281 81 256 C95 231 67 209 91 184 C119 159 152 174 179 153 C203 135 234 151 260 137 C291 121 315 142 339 149 C365 155 373 164 388 184Z',
    fill: 'none',
    stroke: 'var(--ink-soft)',
    'stroke-width': 1,
    'vector-effect': 'non-scaling-stroke',
  });
  const dots = svgElement('g', { fill: 'currentColor' });
  const companion = pilgrimFigure(0.25);
  const pilgrim = pilgrimFigure(0.85);
  svg.append(path, dots, companion, pilgrim);
  container.append(svg);
  const length = path.getTotalLength();
  const markers = Array.from({ length: 88 }, (_, index) => {
    const point = path.getPointAtLength(length * index / 88);
    const dot = svgElement('circle', { cx: point.x, cy: point.y, r: 1.85, opacity: 0.25 });
    dots.append(dot);
    return dot;
  });
  return {
    render(progress, reduced) {
      const journey = reduced ? 0.34 : progress;
      const point = path.getPointAtLength(journey * length);
      const before = path.getPointAtLength((journey * length - 15 + length) % length);
      companion.setAttribute('transform', `translate(${before.x - 8} ${before.y - 9})`);
      pilgrim.setAttribute('transform', `translate(${point.x} ${point.y})`);
      markers.forEach((dot, index) => {
        dot.setAttribute('opacity', index / 88 <= journey ? '0.62' : '0.24');
      });
    },
    resize() {},
    destroy() { svg.remove(); },
  };
}

function babelReversed(container, words) {
  const stage = document.createElement('div');
  stage.className = 'babel-stage';
  stage.setAttribute('aria-hidden', 'true');
  const ren = document.createElement('span');
  ren.className = 'babel-ren';
  ren.lang = 'zh-Hant';
  ren.textContent = '仁';
  stage.append(ren);
  // A ziggurat of legible bricks: every brick keeps one constant size.
  const rowCounts = [2, 3, 4, 5, 6, 7];
  const total = rowCounts.reduce((sum, count) => sum + count, 0);
  const bricks = Array.from({ length: total }, (_, index) => {
    const word = words[index % words.length];
    const element = document.createElement('span');
    element.className = 'babel-brick';
    element.lang = word.lang;
    element.dir = word.dir;
    element.textContent = word.text;
    element.style.fontSize = `${15 + (word.weight - 1)}px`;
    stage.append(element);
    return { element, index: 0, row: 0, x: 0, y: 0, width: 0 };
  });
  container.append(stage);

  function resize() {
    for (const brick of bricks) brick.width = brick.element.offsetWidth;
    // Shortest words crown the tower; the widest carry its base.
    const sorted = [...bricks].sort((a, b) => a.width - b.width);
    let cursor = 0;
    const rows = rowCounts.map(count => sorted.slice(cursor, cursor += count));
    const gap = 9;
    const rowHeight = 27;
    const widest = Math.max(...rows.map(row => row.reduce((sum, brick) => sum + brick.width, 0) + gap * (row.length - 1)));
    rows.forEach((row, rowIndex) => {
      const rowWidth = row.reduce((sum, brick) => sum + brick.width, 0) + gap * (row.length - 1);
      let x = 250 - rowWidth / 2;
      row.forEach(brick => {
        brick.row = rowIndex;
        brick.x = x + brick.width / 2;
        brick.y = 420 - (rows.length - 1 - rowIndex) * rowHeight;
        x += brick.width + gap;
      });
    });
    // Lift order: top row first, then row by row downwards.
    [...bricks].sort((a, b) => a.row - b.row || a.x - b.x).forEach((brick, index) => { brick.index = index; });
    const size = Math.min(container.clientWidth, container.clientHeight);
    stage.style.transform = `translate(-50%, -50%) scale(${Math.min(size / 500, size / (widest + 40))})`;
  }

  resize();
  return {
    resize,
    render(progress, reduced) {
      const sceneProgress = reduced ? 0 : progress;
      ren.style.opacity = String(reduced ? 0.1 : 0.12 * ease(clamp((progress - 0.3) / 0.6)));
      for (const brick of bricks) {
        const delay = brick.index / (bricks.length - 1) * 0.55;
        const flight = clamp((sceneProgress - delay) / 0.45);
        const lift = ease(clamp(flight / 0.5));
        const convergence = ease(clamp((flight - 0.35) / 0.65));
        const phase = brick.index * 2.399963;
        // Bricks never fall: every waypoint is at or above where they started.
        const floatX = brick.x + Math.sin(phase) * 38;
        const floatY = brick.y - 40 - Math.abs(Math.cos(phase)) * 60;
        const targetX = 250 + Math.cos(phase) * 22;
        const targetY = 160 + Math.sin(phase) * 18;
        const x = mix(mix(brick.x, floatX, lift), targetX, convergence);
        const y = Math.min(brick.y, mix(mix(brick.y, floatY, lift), targetY, convergence));
        const sway = Math.sin(flight * Math.PI * 2 + phase) * Math.sin(flight * Math.PI) * 7;
        brick.element.style.transform = `translate3d(${x + sway}px, ${y}px, 0) translate(-50%, -50%) scale(${mix(1, 0.9, convergence)})`;
        brick.element.style.opacity = String(mix(0.7, 0.15, convergence));
      }
    },
    destroy() { stage.remove(); },
  };
}

/** Wire every chapter to one passive, frame-coalesced scroll handler. */
export function initChapters({ words, reducedMotion = false }) {
  let reduced = Boolean(reducedMotion);
  let frame = 0;
  let destroyed = false;
  const chapters = [];
  const builders = [personAndTwo, henroLoop, container => babelReversed(container, words)];
  builders.forEach((build, index) => {
    const section = document.getElementById(`chapter-${index + 1}`);
    const visual = section?.querySelector('.chapter-visual');
    if (visual && (index !== 2 || words.length)) {
      visual.setAttribute('aria-hidden', 'true');
      chapters.push({ section, visual, scene: build(visual) });
    }
  });

  function update() {
    frame = 0;
    if (destroyed || document.hidden) return;
    const height = window.innerHeight;
    // Batch all geometry reads before changing transforms and SVG attributes.
    const positions = chapters.map(chapter => ({
      section: chapter.section.getBoundingClientRect(),
      visual: chapter.visual.getBoundingClientRect(),
    }));
    chapters.forEach((chapter, index) => {
      const { section, visual } = positions[index];
      const visualOffset = visual.top - section.top;
      const visualTop = section.top + visualOffset;
      // Finish while the drawing is still visible, even above a long mobile
      // text column. Its top crosses 70% → 10% of the viewport over the scene.
      const progress = clamp((height * 0.7 - visualTop) / (height * 0.6));
      chapter.section.dataset.progress = progress.toFixed(3);
      chapter.scene.render(progress, reduced);
    });
  }

  function schedule() {
    if (!frame && !document.hidden && !destroyed) frame = requestAnimationFrame(update);
  }

  function resize() {
    chapters.forEach(chapter => chapter.scene.resize());
    schedule();
  }

  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else schedule();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  document.fonts?.ready.then(() => { if (!destroyed) resize(); });
  document.fonts?.addEventListener('loadingdone', resize);
  schedule();

  return {
    setReducedMotion(value) {
      reduced = Boolean(value);
      schedule();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      document.fonts?.removeEventListener('loadingdone', resize);
      chapters.forEach(chapter => chapter.scene.destroy());
    },
  };
}
