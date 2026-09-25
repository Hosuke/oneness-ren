/* The floating words stay separate: their meetings are drawn as threads. */
const TAU = Math.PI * 2;
const random = (low, high) => low + Math.random() * (high - low);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const ease = value => value * value * (3 - 2 * value);
let paperTile;

export function makePaper() {
  if (paperTile) return paperTile;
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
  paperTile = tile.toDataURL();
  return paperTile;
}

function intersects(x, y, width, height, box, padding = 0) {
  return box && x + width / 2 + padding > box.left &&
    x - width / 2 - padding < box.right &&
    y + height / 2 + padding > box.top &&
    y - height / 2 - padding < box.bottom;
}

/**
 * A self-contained scene. The owner opens a card in onSelect(entry, span, release).
 * Call release when that card closes. Public visibility setters are also useful
 * to an embedding page; observers here make each scene safe to use on its own.
 */
export class FloatScene {
  constructor(section, { words, onSelect, intro = true, calm = false, reduced } = {}) {
    if (!section || !Array.isArray(words) || words.length === 0) {
      throw new TypeError('FloatScene needs a section and at least one word.');
    }
    this.section = section;
    this.words = words;
    this.onSelect = onSelect;
    this.intro = intro;
    this.calm = calm;
    this.stone = section.querySelector('.stone');
    this.glow = section.querySelector('.stone-glow');
    this.canvas = section.querySelector('.threads');
    this.layer = section.querySelector('.floats');
    this.caption = section.querySelector('.scene-caption');
    this.context = this.canvas.getContext('2d');
    this.layer.setAttribute('aria-hidden', 'true');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.pointerEvents = 'none';
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.schemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.reduced = reduced ?? this.motionQuery.matches;
    this.documentVisible = document.visibilityState !== 'hidden';
    const bounds = section.getBoundingClientRect();
    this.inView = bounds.bottom > 0 && bounds.top < window.innerHeight;
    this.items = [];
    this.elapsed = 0;
    this.lastTime = null;
    this.frame = null;
    this.alpha = this.reduced ? 0.08 : intro ? 0 : 0.06;
    this.pointer = { x: 0, y: 0, active: false, down: false, type: 'mouse', released: -Infinity };
    this.removers = [];
    this.tick = this.tick.bind(this);
    this.resize = this.resize.bind(this);
    this.listen(section, 'pointerenter', event => this.pointerEnter(event), { passive: true });
    this.listen(section, 'pointermove', event => this.pointerMove(event), { passive: true });
    this.listen(section, 'pointerdown', event => this.pointerDown(event), { passive: true });
    this.listen(section, 'pointerleave', event => this.pointerLeave(event), { passive: true });
    this.listen(window, 'pointerup', event => this.pointerUp(event), { passive: true });
    this.listen(window, 'pointercancel', event => this.pointerUp(event), { passive: true });
    this.listen(document, 'visibilitychange', () => this.setDocumentVisible(document.visibilityState !== 'hidden'));
    this.listen(this.schemeQuery, 'change', () => {
      this.readInk();
      this.drawLines();
    });
    this.listen(window, 'resize', this.resize, { passive: true });
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(section);
    this.intersectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) this.setVisibility(entry.isIntersecting);
    }, { threshold: 0 });
    this.intersectionObserver.observe(section);
    if (document.fonts) {
      this.listen(document.fonts, 'loadingdone', this.resize);
      document.fonts.ready.then(() => { if (!this.destroyed) this.resize(); });
    }
    this.resize();
    if (this.reduced) this.scatter();
    else if (!this.intro) this.scatter(true);
    this.paint();
    this.syncLoop();
  }

  listen(target, event, callback, options) {
    target.addEventListener(event, callback, options);
    this.removers.push(() => target.removeEventListener(event, callback, options));
  }

  readInk() {
    this.ink = getComputedStyle(this.section).getPropertyValue('--ink').trim() || '#1a1814';
  }

  chooseEntry(previous) {
    const occupied = new Set(this.items.filter(item => item !== previous).map(item => item.entry.text));
    const available = this.words.filter(entry => !occupied.has(entry.text));
    let pool = available.filter(entry => entry.id !== previous?.entry.id);
    // When N equals the population, retaining this one entry is the only way
    // to keep the scene free of duplicates. With N=1 repetition is intentional.
    if (!pool.length) pool = available;
    if (!pool.length) pool = this.words.filter(entry => entry.id !== previous?.entry.id);
    if (!pool.length) pool = this.words;
    let choice = Math.random() * pool.reduce((sum, entry) => sum + entry.weight, 0);
    for (const entry of pool) {
      choice -= entry.weight;
      if (choice <= 0) return entry;
    }
    return pool[pool.length - 1];
  }

  addWord() {
    const element = document.createElement('span');
    element.className = 'w';
    element.tabIndex = -1;
    element.setAttribute('role', 'button');
    Object.assign(element.style, {
      position: 'absolute', left: '0', top: '0', display: 'block',
      whiteSpace: 'nowrap', lineHeight: '1.2', cursor: 'pointer',
      userSelect: 'none', transformOrigin: 'center', willChange: 'transform',
    });
    // Keep scale on a child: an individual CSS scale on the translated parent
    // would also multiply its translation and move the word away from its card.
    const glyph = document.createElement('span');
    glyph.className = 'word-ink';
    Object.assign(glyph.style, {
      display: 'block', transformOrigin: 'center', transform: 'scale(1)',
      transition: this.reduced ? 'none' : 'transform 600ms cubic-bezier(.2,.7,.2,1)',
    });
    element.append(glyph);
    const item = {
      element, glyph, entry: this.chooseEntry(), x: 0, y: 0, rx: 0, ry: 0,
      vx: 0, vy: 0, width: 40, height: 48, frozen: false,
      traverse: random(20, 40) * (this.calm ? 1.35 : 1),
      amplitude: random(8, 20) * (this.calm ? 0.75 : 1),
      period: random(6, 14), phase: random(0, TAU),
      opacity: random(0.60, 0.85), pending: true,
      spawnAt: this.intro && this.elapsed < 7 ? 3 + random(0, 4) : this.elapsed,
    };
    element.addEventListener('click', event => {
      event.stopPropagation();
      if (item.pending || item.frozen) return;
      this.select(item);
    });
    this.layer.append(element);
    this.items.push(item);
    this.setEntry(item, item.entry);
    item.rise = this.height / item.traverse;
    item.vy = -item.rise;
    item.x = this.spawnX(item);
    item.y = this.height + item.height / 2 + 2;
    item.rx = item.x;
    item.ry = item.y;
    return item;
  }

  setEntry(item, entry) {
    item.entry = entry;
    item.glyph.textContent = entry.text;
    item.element.lang = entry.lang;
    item.element.dir = entry.dir;
    item.element.dataset.wordId = entry.id;
    const sizes = { 1: [18, 24], 2: [26, 34], 3: [36, 44] };
    const range = sizes[entry.weight] || sizes[1];
    const factor = clamp(window.innerWidth / 1200, 0.62, 1);
    item.element.style.fontSize = `${Math.max(14, random(...range) * factor).toFixed(2)}px`;
    this.measureWord(item);
  }

  measureWord(item) {
    item.width = item.element.offsetWidth || 40;
    item.height = item.element.offsetHeight || 48;
  }

  spawnX(item) {
    const margin = item.width / 2 + 14;
    const low = Math.min(margin, this.width / 2);
    const high = Math.max(low, this.width - margin);
    // A few candidates keep the emerging words from sharing one column.
    let best = random(low, high);
    let bestDistance = -1;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = random(low, high);
      const others = this.items.filter(other => other !== item && other.y > this.height - 100);
      const distance = others.length ? Math.min(...others.map(other => Math.abs(other.x - candidate))) : this.width;
      if (distance > bestDistance) { best = candidate; bestDistance = distance; }
    }
    return best;
  }

  resize() {
    if (this.destroyed) return;
    const oldWidth = this.width || this.section.clientWidth || 1;
    const oldHeight = this.height || this.section.clientHeight || 1;
    this.width = Math.max(1, this.section.clientWidth);
    this.height = Math.max(1, this.section.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const bounds = this.section.getBoundingClientRect();
    const caption = this.caption?.getBoundingClientRect();
    this.captionBox = caption ? {
      left: caption.left - bounds.left - 16,
      right: caption.right - bounds.left + 16,
      top: caption.top - bounds.top - 16,
      bottom: caption.bottom - bounds.top + 16,
    } : null;
    this.readInk();
    const areaCount = Math.round(18 * Math.sqrt(this.width * this.height / (1440 * 900)));
    const count = this.calm ? clamp(Math.round(areaCount * 0.55), 6, 10) : clamp(areaCount, 12, 20);
    while (this.items.length < count) this.addWord();
    for (let index = this.items.length - 1; this.items.length > count && index >= 0; index -= 1) {
      if (!this.items[index].frozen) {
        this.items[index].element.remove();
        this.items.splice(index, 1);
      }
    }
    for (const item of this.items) {
      this.measureWord(item);
      const half = Math.min(this.width / 2, item.width / 2 + 10);
      item.x = clamp(item.x * this.width / oldWidth, half, this.width - half);
      item.y = item.pending ? this.height + item.height / 2 + 2 : item.y * this.height / oldHeight;
      item.rise = this.height / item.traverse;
      item.vy = clamp(item.vy, -item.rise * 3, item.rise * 2);
      item.rx = clamp(item.rx * this.width / oldWidth, half, this.width - half);
      item.ry *= this.height / oldHeight;
    }
    if (this.reduced) {
      // Fonts arrive in several batches; settle once rather than reshuffling each time.
      clearTimeout(this.scatterTimer);
      this.scatterTimer = setTimeout(() => {
        if (this.reduced && !this.destroyed) { this.scatter(); this.paint(); }
      }, 250);
    }
    this.paint();
  }

  scatter(loose = false) {
    const placed = [];
    const captionWide = this.captionBox && this.captionBox.right - this.captionBox.left > this.width * 0.65;
    const usableHeight = captionWide ? Math.max(this.height * 0.55, this.captionBox.top - 16) : this.height - 30;
    const columns = Math.max(2, Math.ceil(Math.sqrt(this.items.length * this.width / usableHeight)));
    const rows = Math.ceil(this.items.length / columns);
    const sorted = [...this.items].sort((a, b) => b.width - a.width);
    sorted.forEach((item, index) => {
      if (item.frozen) { placed.push(item); return; }
      const halfW = item.width / 2 + 14;
      const halfH = item.height / 2 + 14;
      const anchorX = (index % columns + 0.5) * this.width / columns;
      const anchorY = (Math.floor(index / columns) + 0.5) * usableHeight / rows;
      let chosen;
      for (let attempt = 0; attempt < 450; attempt += 1) {
        const anchored = attempt === 0 && !loose;
        const x = clamp(anchored ? anchorX + random(-8, 8) : random(halfW, this.width - halfW), halfW, this.width - halfW);
        const y = clamp(anchored ? anchorY + random(-9, 9) : random(halfH, usableHeight - halfH), halfH, this.height - halfH);
        if (intersects(x, y, item.width, item.height, this.captionBox, 9)) continue;
        if (placed.some(other => Math.abs(x - other.rx) < (item.width + other.width) / 2 + 16 &&
          Math.abs(y - other.ry) < (item.height + other.height) / 2 + 16)) continue;
        chosen = { x, y };
        break;
      }
      // Normal dictionary entries fit the first grid. This final grid candidate
      // keeps even unusually long source text inside the scene's bounds.
      chosen ||= { x: clamp(anchorX, halfW, Math.max(halfW, this.width - halfW)), y: clamp(anchorY, halfH, this.height - halfH) };
      item.x = item.rx = chosen.x;
      item.y = item.ry = chosen.y;
      item.pending = false;
      item.born = this.elapsed - 1;
      item.vx = 0;
      item.vy = -item.rise;
      placed.push(item);
    });
  }

  pointerPosition(event) {
    const bounds = this.section.getBoundingClientRect();
    this.pointer.x = event.clientX - bounds.left;
    this.pointer.y = event.clientY - bounds.top;
    this.pointer.type = event.pointerType;
  }

  pointerEnter(event) {
    if (event.pointerType === 'mouse') {
      this.pointerPosition(event);
      this.pointer.active = true;
    }
  }

  pointerMove(event) {
    if (event.pointerType === 'mouse' || this.pointer.down) {
      this.pointerPosition(event);
      this.pointer.active = true;
    }
  }

  pointerDown(event) {
    this.pointerPosition(event);
    this.pointer.active = true;
    this.pointer.down = true;
    this.pointer.pointerId = event.pointerId;
    this.pointer.released = -Infinity;
  }

  pointerUp(event) {
    if (event.pointerId !== this.pointer.pointerId) return;
    this.pointer.down = false;
    if (this.pointer.type !== 'mouse') {
      this.pointer.active = false;
      this.pointer.released = this.elapsed;
    }
  }

  pointerLeave(event) {
    if (event.pointerType === 'mouse') this.pointer.active = false;
    else this.pointerUp(event);
  }

  pointerStrength() {
    if (this.pointer.active) return 1;
    return this.pointer.type === 'mouse' ? 0 : clamp(1 - (this.elapsed - this.pointer.released) / 1.5, 0, 1);
  }

  select(item) {
    item.frozen = true;
    item.element.classList.add('is-frozen');
    item.glyph.style.transform = 'scale(1.6)';
    item.element.style.zIndex = '2';
    let released = false;
    const release = () => {
      if (released || this.destroyed) return;
      released = true;
      item.frozen = false;
      item.x = item.rx - (this.reduced ? 0 : this.sway(item));
      item.y = item.ry;
      item.vx = 0;
      item.vy = -item.rise;
      item.element.classList.remove('is-frozen');
      item.glyph.style.transform = 'scale(1)';
      item.element.style.zIndex = '';
      if (this.reduced) this.paint();
    };
    if (typeof this.onSelect === 'function') this.onSelect(item.entry, item.element, release);
    else release();
  }

  sway(item) {
    return Math.sin(this.elapsed * TAU / item.period + item.phase) * item.amplitude;
  }

  captionForce(item, force) {
    const box = this.captionBox;
    if (!box) return;
    const x = item.rx;
    const y = item.ry;
    const nearestX = clamp(x, box.left - item.width / 2, box.right + item.width / 2);
    const nearestY = clamp(y, box.top - item.height / 2, box.bottom + item.height / 2);
    const dx = x - nearestX;
    const dy = y - nearestY;
    const distance = Math.hypot(dx, dy);
    if (distance > 0 && distance < 55) {
      const strength = 105 * (1 - distance / 55);
      force.x += dx / distance * strength;
      // Below the caption, make a passage upwards. Repelling downward here
      // would trap fresh words beneath a full-width mobile caption forever.
      force.y += (dy > 0 ? -dy : dy) / distance * strength;
    } else if (distance === 0) {
      // Never push an emerging word back below the paper; guide it past the
      // caption's top edge, or its side when there is enough room there.
      const exits = [{ distance: Math.abs(y - box.top), x: 0, y: -1 }];
      if (box.left > item.width + 35) exits.push({ distance: Math.abs(x - box.left), x: -1, y: 0 });
      if (this.width - box.right > item.width + 35) exits.push({ distance: Math.abs(x - box.right), x: 1, y: 0 });
      exits.sort((a, b) => a.distance - b.distance);
      force.x += exits[0].x * 130;
      force.y += exits[0].y * 130;
    }
  }

  advance(dt) {
    const strength = this.pointerStrength();
    const forces = this.items.map(() => ({ x: 0, y: 0 }));
    for (let index = 0; index < this.items.length; index += 1) {
      const item = this.items[index];
      if (item.pending) {
        if (this.elapsed < item.spawnAt) continue;
        item.pending = false;
        item.born = this.elapsed;
      }
      if (item.frozen) continue;
      const force = forces[index];
      const dx = this.pointer.x - item.rx;
      const dy = this.pointer.y - item.ry;
      const distance = Math.hypot(dx, dy);
      if (strength && distance > 1 && distance < 220) {
        const acceleration = Math.min(100, 100 * (1 - distance / 220)) * strength;
        force.x += dx / distance * acceleration;
        force.y += dy / distance * acceleration;
      }
      this.captionForce(item, force);
      const margin = item.width / 2 + 15;
      if (item.rx < margin + 20) force.x += (margin + 20 - item.rx) * 2;
      if (item.rx > this.width - margin - 20) force.x -= (item.rx - this.width + margin + 20) * 2;
    }
    for (let first = 0; first < this.items.length; first += 1) {
      const a = this.items[first];
      if (a.pending) continue;
      for (let second = first + 1; second < this.items.length; second += 1) {
        const b = this.items[second];
        if (b.pending) continue;
        const dx = a.rx - b.rx;
        const dy = a.ry - b.ry;
        // Measured boxes, padded: push apart along the axis of least penetration.
        const overlapX = (a.width + b.width) / 2 + 16 - Math.abs(dx);
        const overlapY = (a.height + b.height) / 2 + 16 - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        const side = (value, fallback) => value > 0 ? 1 : value < 0 ? -1 : fallback;
        // Sideways is preferred: pushing down would fight the rise.
        const sideways = overlapX < overlapY * 1.6;
        const fx = sideways ? side(dx, first < second ? 1 : -1) * Math.min(260, overlapX * 7) : 0;
        const fy = sideways ? 0 : side(dy, first < second ? 1 : -1) * Math.min(200, overlapY * 5);
        if (!a.frozen) { forces[first].x += fx; forces[first].y += fy; }
        if (!b.frozen) { forces[second].x -= fx; forces[second].y -= fy; }
      }
    }
    const damping = Math.exp(-1.5 * dt);
    for (let index = 0; index < this.items.length; index += 1) {
      const item = this.items[index];
      if (item.pending || item.frozen) continue;
      item.vx = clamp((item.vx + forces[index].x * dt) * damping, -100, 100);
      item.vy = clamp(-item.rise + (item.vy + item.rise + forces[index].y * dt) * damping, -130, 90);
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      const half = Math.min(this.width / 2, item.width / 2 + 8);
      item.x = clamp(item.x, half - this.sway(item), this.width - half - this.sway(item));
      item.rx = item.x + this.sway(item);
      item.ry = item.y;
      if (item.y + item.height / 2 < -12) this.respawn(item);
    }
    const nearby = strength ? this.items.filter(item => !item.pending &&
      Math.hypot(item.rx - this.pointer.x, item.ry - this.pointer.y) < 220).length : 0;
    this.targetAlpha = 0.06 + Math.min(nearby, 6) / 6 * 0.12 * strength;
    if (this.intro && this.elapsed < 3) this.alpha = 0.06 * ease(clamp((this.elapsed - 0.6) / 2.4, 0, 1));
    else this.alpha += (this.targetAlpha - this.alpha) * (1 - Math.exp(-dt / 1.2));
  }

  respawn(item) {
    const entry = this.chooseEntry(item);
    this.setEntry(item, entry);
    item.traverse = random(20, 40) * (this.calm ? 1.35 : 1);
    item.rise = this.height / item.traverse;
    item.x = this.spawnX(item);
    item.y = this.height + item.height / 2 + 2;
    item.rx = item.x;
    item.ry = item.y;
    item.vx = 0;
    item.vy = -item.rise;
    item.pending = true;
    item.spawnAt = this.elapsed + random(0, 3);
  }

  paint() {
    if (this.stone) this.stone.style.opacity = String(this.reduced ? 0.08 : this.alpha);
    if (this.glow) this.glow.style.opacity = String(this.reduced || this.alpha <= 0.09 ? 0 : Math.min(0.25, (this.alpha - 0.09) / 0.09 * 0.25));
    if (this.caption) this.caption.style.opacity = String(this.reduced || !this.intro ? 1 : ease(clamp((this.elapsed - 3) / 1.2, 0, 1)));
    for (const item of this.items) {
      item.element.style.transform = `translate3d(${(item.rx - item.width / 2).toFixed(2)}px, ${(item.ry - item.height / 2).toFixed(2)}px, 0)`;
      const overCaption = intersects(item.rx, item.ry, item.width, item.height, this.captionBox, 1);
      const fade = this.reduced ? 1 : clamp((this.elapsed - (item.born ?? this.elapsed)) / 0.65, 0, 1);
      const visible = !item.pending && !overCaption;
      item.visible = visible;
      item.element.style.opacity = String(visible ? item.opacity * fade : 0);
      item.element.style.pointerEvents = visible ? 'auto' : 'none';
    }
    this.drawLines();
  }

  drawLines() {
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);
    context.lineWidth = 0.5;
    context.strokeStyle = this.ink;
    for (let first = 0; first < this.items.length; first += 1) {
      const a = this.items[first];
      if (!a.visible) continue;
      for (let second = first + 1; second < this.items.length; second += 1) {
        const b = this.items[second];
        if (!b.visible) continue;
        const distance = Math.hypot(a.rx - b.rx, a.ry - b.ry);
        if (distance >= 140) continue;
        context.globalAlpha = 0.35 * (1 - distance / 140);
        context.beginPath();
        context.moveTo(a.rx, a.ry);
        context.lineTo(b.rx, b.ry);
        context.stroke();
      }
    }
    context.globalAlpha = 1;
  }

  tick(time) {
    this.frame = null;
    if (!this.shouldRun()) { this.lastTime = null; return; }
    const dt = this.lastTime === null ? 0 : Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.elapsed += dt;
    this.advance(dt);
    this.paint();
    this.frame = requestAnimationFrame(this.tick);
  }

  shouldRun() {
    return !this.destroyed && !this.reduced && this.inView && this.documentVisible;
  }

  syncLoop() {
    if (this.shouldRun()) {
      if (this.frame === null) {
        this.lastTime = null;
        this.frame = requestAnimationFrame(this.tick);
      }
    } else {
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = null;
      this.lastTime = null;
    }
  }

  setVisibility(isVisible) {
    this.inView = Boolean(isVisible);
    if (!this.inView) {
      this.pointer.active = false;
      this.pointer.down = false;
      this.pointer.released = -Infinity;
    }
    this.syncLoop();
  }

  setDocumentVisible(isVisible) {
    this.documentVisible = Boolean(isVisible);
    this.syncLoop();
  }

  setReducedMotion(isReduced) {
    if (this.reduced === Boolean(isReduced)) return;
    this.reduced = Boolean(isReduced);
    this.intro = false;
    this.alpha = this.reduced ? 0.08 : 0.06;
    for (const item of this.items) item.glyph.style.transition = this.reduced ? 'none' : 'transform 600ms cubic-bezier(.2,.7,.2,1)';
    if (this.reduced) this.scatter();
    else {
      for (const item of this.items) item.x = item.rx - this.sway(item);
    }
    this.paint();
    this.syncLoop();
  }

  destroy() {
    this.destroyed = true;
    this.syncLoop();
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    for (const remove of this.removers) remove();
    for (const item of this.items) item.element.remove();
    this.items = [];
    this.context.clearRect(0, 0, this.width, this.height);
  }
}
