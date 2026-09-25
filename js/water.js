/*
 * 水面之景。仁沉在水下，諸語浮在水上。
 * 執則薄，化則厚：一動，水紋亂，仁散為二影而淡；一靜，水自平，二影合一，仁自浮現。
 * Words float on the surface; 仁 lies beneath. Stirring the water splits 仁 into
 * two wavering images and thins it; stillness lets them settle into one.
 */
const TAU = Math.PI * 2;
const random = (low, high) => low + Math.random() * (high - low);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const smooth = value => value * value * (3 - 2 * value);
const REN_FONT = '"LXGW WenKai TC", "Kaiti TC", "STKaiti", "KaiTi", serif';

export function makePaper() {
  const tile = document.createElement('canvas');
  tile.width = tile.height = 256;
  const context = tile.getContext('2d');
  const pixels = context.createImageData(256, 256);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const shade = Math.random() > 0.48 ? 255 : 0;
    pixels.data[index] = pixels.data[index + 1] = pixels.data[index + 2] = shade;
    pixels.data[index + 3] = Math.floor(random(2, 9));
  }
  context.putImageData(pixels, 0, 0);
  context.lineWidth = 0.5;
  for (let index = 0; index < 65; index += 1) {
    const x = random(0, 256);
    const y = random(0, 256);
    context.strokeStyle = `rgba(110, 102, 85, ${random(0.015, 0.045)})`;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x + random(2, 9), y + random(-2, 2), x + random(10, 28), y + random(-3, 3));
    context.stroke();
  }
  return tile.toDataURL();
}

export class WaterScene {
  constructor(section, { words, onSelect, reduced = false }) {
    this.section = section;
    this.words = words;
    this.onSelect = onSelect;
    this.reduced = reduced;
    this.depth = section.querySelector('.depth');
    this.surface = section.querySelector('.surface');
    this.layer = section.querySelector('.floats');
    this.depthContext = this.depth.getContext('2d');
    this.surfaceContext = this.surface.getContext('2d');
    this.glyph = document.createElement('canvas');
    this.items = [];
    this.rings = [];
    this.time = 0;
    this.energy = 0;          // how stirred the water is
    this.still = 0;           // seconds since the last stir
    this.alpha = 0;           // opacity of 仁
    this.pointer = { x: 0, y: 0, speed: 0, inside: false, travelled: 0 };
    this.frame = null;
    this.last = null;
    this.visible = true;
    this.tick = this.tick.bind(this);
    this.resize = this.resize.bind(this);

    section.addEventListener('pointermove', event => this.move(event), { passive: true });
    section.addEventListener('pointerdown', event => this.touch(event), { passive: true });
    section.addEventListener('pointerleave', () => { this.pointer.inside = false; }, { passive: true });
    window.addEventListener('resize', this.resize, { passive: true });
    document.addEventListener('visibilitychange', () => this.sync());
    new IntersectionObserver(entries => {
      this.visible = entries.some(entry => entry.isIntersecting);
      this.sync();
    }).observe(section);
    const redraw = () => { this.drawGlyph(); this.measure(); if (this.reduced) this.paint(); };
    // Evening: the OS turns dark; the ink under the water must turn with it.
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.ink = getComputedStyle(this.section).getPropertyValue('--ink').trim() || '#1a1814';
      this.drawGlyph();
      this.paint();
    });
    document.fonts?.addEventListener('loadingdone', redraw);
    document.fonts?.load(`100px ${REN_FONT}`, '仁').then(redraw, () => {});

    this.resize();
    this.sync();
  }

  // ── 水下之仁 ─────────────────────────────────────────
  drawGlyph() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const size = this.glyphSize;
    this.glyph.width = this.glyph.height = Math.round(size * ratio);
    const context = this.glyph.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size, size);
    context.fillStyle = getComputedStyle(this.section).getPropertyValue('--stone-ink').trim() || '#1a1814';
    context.font = `${size}px ${REN_FONT}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('仁', size / 2, size * 0.53);
  }

  paintDepth() {
    const context = this.depthContext;
    const { width, height, glyphSize: size } = this;
    context.clearRect(0, 0, width, height);
    if (this.alpha <= 0.001) return;
    const stir = clamp(this.energy, 0, 1.4);
    const left = (width - size) / 2;
    const top = (height - size) / 2 - height * 0.02;
    // Always a faint underwater breath; stirring deepens the waves.
    const amplitude = this.reduced ? 0 : 1.2 + stir * 16;
    // Stirred, the one image parts into two — 二而不二.
    const split = this.reduced ? 0 : stir * 16;
    const copies = split > 0.4 ? [-split, split] : [0];
    const strip = 3;
    const scale = this.glyph.width / size;
    for (const shift of copies) {
      context.globalAlpha = this.alpha * (copies.length > 1 ? 0.62 : 1);
      for (let y = 0; y < size; y += strip) {
        const wave = Math.sin(y * 0.021 + this.time * 0.9 + shift * 0.08) * amplitude
          + Math.sin(y * 0.047 - this.time * 1.4) * amplitude * 0.45;
        context.drawImage(this.glyph, 0, y * scale, this.glyph.width, strip * scale,
          left + wave + shift, top + y, size, strip);
      }
    }
    context.globalAlpha = 1;
  }

  // ── 水面 ────────────────────────────────────────────
  stir(amount, x, y) {
    this.energy = Math.min(1.6, this.energy + amount);
    this.still = 0;
    if (!this.reduced && x !== undefined) this.rings.push({ x, y, age: 0, strength: Math.min(1, amount * 3) });
  }

  move(event) {
    const bounds = this.section.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const distance = this.pointer.inside ? Math.hypot(x - this.pointer.x, y - this.pointer.y) : 0;
    this.pointer = { ...this.pointer, x, y, inside: true, speed: distance, travelled: this.pointer.travelled + distance };
    if (distance > 0) this.stir(Math.min(0.08, distance / 900));
    if (this.pointer.travelled > 140) {
      this.pointer.travelled = 0;
      if (!this.reduced) this.rings.push({ x, y, age: 0, strength: 0.35 });
    }
  }

  touch(event) {
    const bounds = this.section.getBoundingClientRect();
    this.pointer = { ...this.pointer, x: event.clientX - bounds.left, y: event.clientY - bounds.top, inside: event.pointerType === 'mouse' };
    this.stir(0.45, this.pointer.x, this.pointer.y);
  }

  paintSurface() {
    const context = this.surfaceContext;
    context.clearRect(0, 0, this.width, this.height);
    context.strokeStyle = this.ink;
    context.lineWidth = 0.6;
    for (const ring of this.rings) {
      const life = ring.age / 3.2;
      context.globalAlpha = 0.22 * ring.strength * (1 - life);
      context.beginPath();
      context.ellipse(ring.x, ring.y, 8 + ring.age * 70, (8 + ring.age * 70) * 0.42, 0, 0, TAU);
      context.stroke();
    }
    // 相人偶：two words that drift near are joined by a hairline, never merged.
    context.lineWidth = 0.5;
    for (let first = 0; first < this.items.length; first += 1) {
      const a = this.items[first];
      for (let second = first + 1; second < this.items.length; second += 1) {
        const b = this.items[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance >= 150) continue;
        context.globalAlpha = 0.3 * (1 - distance / 150) * Math.min(a.fade, b.fade);
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
    context.globalAlpha = 1;
  }

  // ── 浮字 ────────────────────────────────────────────
  choose() {
    const shown = new Set(this.items.filter(item => item.entry).map(item => item.entry.text));
    const pool = this.words.filter(entry => !shown.has(entry.text));
    const list = pool.length ? pool : this.words;
    return list[Math.floor(Math.random() * list.length)];
  }

  addWord(index, count) {
    const element = document.createElement('span');
    element.className = 'w';
    element.setAttribute('role', 'button');
    element.tabIndex = -1;
    const inner = document.createElement('span');
    inner.className = 'word-ink';
    element.append(inner);
    this.layer.append(element);
    const item = {
      element, inner, entry: null, x: 0, y: 0, vx: 0, vy: 0, width: 40, height: 30,
      fade: 0, born: this.time + (this.reduced ? 0 : 0.4 + index * 0.12), frozen: false,
      drift: random(0, TAU), bob: random(0, TAU),
    };
    element.addEventListener('click', event => {
      event.stopPropagation();
      if (!item.frozen && item.fade > 0.3) this.select(item);
    });
    this.items.push(item);
    this.setEntry(item, this.choose());
    this.place(item, index, count);
    return item;
  }

  setEntry(item, entry) {
    item.entry = entry;
    item.inner.textContent = entry.text;
    item.element.lang = entry.lang;
    item.element.dir = entry.dir;
    // 不親疏：one size for every language.
    item.element.style.fontSize = `${this.fontSize}px`;
    item.width = item.element.offsetWidth || 60;
    item.height = item.element.offsetHeight || 30;
  }

  place(item, index, count) {
    // Loosely scattered across the water, avoiding the others.
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const x = random(item.width / 2 + 24, this.width - item.width / 2 - 24);
      const y = random(item.height / 2 + 30, this.height - item.height / 2 - 40);
      const clash = this.items.some(other => other !== item && other.entry &&
        Math.abs(other.x - x) < (other.width + item.width) / 2 + 26 &&
        Math.abs(other.y - y) < (other.height + item.height) / 2 + 22);
      if (!clash || attempt === 199) { item.x = x; item.y = y; return; }
    }
  }

  measure() {
    for (const item of this.items) {
      item.element.style.fontSize = `${this.fontSize}px`;
      item.width = item.element.offsetWidth || item.width;
      item.height = item.element.offsetHeight || item.height;
    }
  }

  select(item) {
    item.frozen = true;
    item.element.classList.add('is-frozen');
    this.stir(0.3, item.x, item.y);
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      item.frozen = false;
      item.element.classList.remove('is-frozen');
    };
    this.onSelect(item.entry, item.element, release);
  }

  advanceWords(dt) {
    // A slow current that turns over minutes; each word also wanders a little.
    const current = this.time * 0.013;
    const pointer = this.pointer;
    for (const item of this.items) {
      if (item.frozen) continue;
      item.drift += random(-0.25, 0.25) * dt;
      let ax = Math.cos(current) * 2.2 + Math.cos(item.drift) * 1.6;
      let ay = Math.sin(current) * 1.2 + Math.sin(item.drift) * 1.2;
      // A moving hand parts the water: words give way, and return when it rests.
      if (pointer.inside && pointer.speed > 1) {
        const dx = item.x - pointer.x;
        const dy = item.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 1 && distance < 160) {
          const push = Math.min(90, pointer.speed * 5) * (1 - distance / 160);
          ax += dx / distance * push;
          ay += dy / distance * push;
        }
      }
      for (const other of this.items) {
        if (other === item) continue;
        const dx = item.x - other.x;
        const dy = item.y - other.y;
        const overlapX = (item.width + other.width) / 2 + 22 - Math.abs(dx);
        const overlapY = (item.height + other.height) / 2 + 16 - Math.abs(dy);
        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY * 1.6) ax += Math.sign(dx || 1) * Math.min(40, overlapX * 1.5);
          else ay += Math.sign(dy || 1) * Math.min(40, overlapY * 1.5);
        }
      }
      const damping = Math.exp(-0.9 * dt);
      item.vx = (item.vx + ax * dt) * damping;
      item.vy = (item.vy + ay * dt) * damping;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      // The water has no edge: a word that leaves one shore returns at the other.
      const marginX = item.width / 2 + 30;
      const marginY = item.height / 2 + 30;
      if (item.x < -marginX) item.x = this.width + marginX;
      if (item.x > this.width + marginX) item.x = -marginX;
      if (item.y < -marginY) item.y = this.height + marginY;
      if (item.y > this.height + marginY) item.y = -marginY;
    }
    pointer.speed *= Math.exp(-8 * dt);
  }

  paintWords() {
    for (const item of this.items) {
      const age = this.time - item.born;
      item.fade = this.reduced ? 1 : clamp(age / 2.2, 0, 1);
      const bob = this.reduced ? 0 : Math.sin(this.time * 0.6 + item.bob) * 1.5;
      item.element.style.transform = `translate3d(${(item.x - item.width / 2).toFixed(1)}px, ${(item.y - item.height / 2 + bob).toFixed(1)}px, 0)`;
      item.element.style.opacity = String(0.72 * smooth(item.fade));
      item.element.style.pointerEvents = item.fade > 0.3 ? 'auto' : 'none';
    }
  }

  // ── 時 ──────────────────────────────────────────────
  step(dt) {
    this.time += dt;
    this.still += dt;
    this.energy *= Math.exp(-dt / 1.8);
    for (const ring of this.rings) ring.age += dt;
    this.rings = this.rings.filter(ring => ring.age < 3.2);
    // Entering: first only paper; 仁 comes up to 沉 (.05); then, left undisturbed,
    // it keeps surfacing toward .17 — stirred, it thins again.
    const arrival = 0.05 * smooth(clamp((this.time - 0.6) / 2.4, 0, 1));
    const surfacing = 0.09 * smooth(clamp((this.still - 1.5) / 9, 0, 1));
    const target = (arrival + (this.time > 3 ? surfacing : 0)) * (1 - 0.55 * clamp(this.energy, 0, 1));
    this.alpha += (target - this.alpha) * (1 - Math.exp(-dt / (target > this.alpha ? 1.6 : 0.5)));
    this.advanceWords(dt);
  }

  paint() {
    this.paintDepth();
    this.paintSurface();
    this.paintWords();
  }

  tick(now) {
    this.frame = null;
    const dt = this.last === null ? 0 : Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.step(dt);
    this.paint();
    this.sync();
  }

  sync() {
    const run = !this.reduced && this.visible && !document.hidden;
    if (run && this.frame === null) this.frame = requestAnimationFrame(this.tick);
    if (!run) {
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = null;
      this.last = null;
    }
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const oldWidth = this.width || 1;
    const oldHeight = this.height || 1;
    this.width = this.section.clientWidth;
    this.height = this.section.clientHeight;
    for (const canvas of [this.depth, this.surface]) {
      canvas.width = Math.round(this.width * ratio);
      canvas.height = Math.round(this.height * ratio);
      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;
      canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    this.ink = getComputedStyle(this.section).getPropertyValue('--ink').trim() || '#1a1814';
    this.glyphSize = Math.min(this.height * 0.8, this.width * 0.92);
    this.fontSize = Math.round(clamp(this.width / 60, 17, 24));
    this.drawGlyph();
    const count = Math.round(clamp(this.width * this.height / 72000, 9, 16));
    if (this.items.length && oldWidth > 1) {
      for (const item of this.items) {
        item.x *= this.width / oldWidth;
        item.y *= this.height / oldHeight;
      }
    }
    while (this.items.length < count) this.addWord(this.items.length, count);
    // Never take away the word whose card is open.
    for (let index = this.items.length - 1; this.items.length > count && index >= 0; index -= 1) {
      if (!this.items[index].frozen) this.items.splice(index, 1)[0].element.remove();
    }
    this.measure();
    if (this.reduced) this.settle();
    this.paint();
  }

  // Still mode: the water is already calm, and 仁 is simply there.
  settle() {
    this.alpha = 0.12;
    this.energy = 0;
    this.rings = [];
    for (const item of this.items) item.fade = 1;
  }

  setReducedMotion(value) {
    this.reduced = Boolean(value);
    if (this.reduced) this.settle();
    else { this.still = 0; this.last = null; }
    this.paint();
    this.sync();
  }
}
