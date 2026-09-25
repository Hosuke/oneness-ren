import { bilingual, element, original, relationTag, sourceList } from './entries.js';

export class WordCard {
  constructor() {
    this.layer = element('div', 'card-layer');
    this.layer.hidden = true;
    this.backdrop = element('div', 'card-backdrop');
    this.panel = element('section', 'word-card');
    this.panel.id = 'word-dialog';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-modal', 'true');
    this.panel.setAttribute('aria-labelledby', 'card-word');
    this.handle = element('div', 'drawer-handle');
    this.handle.setAttribute('aria-hidden', 'true');
    this.closeButton = element('button', 'card-close');
    this.closeButton.type = 'button';
    this.closeButton.dataset.closeCard = '';
    this.closeButton.append(document.createTextNode('閉 · '));
    const closeEnglish = element('span', 'en', 'close');
    closeEnglish.lang = 'en';
    this.closeButton.append(closeEnglish);
    this.content = element('div', 'card-content');
    this.panel.append(this.handle, this.closeButton, this.content);
    this.layer.append(this.backdrop, this.panel);
    document.body.append(this.layer);
    this.closeButton.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());
    // On the layer, not the panel: a click on plain card text must not strand Esc.
    this.layer.addEventListener('keydown', event => this.onKey(event));
    this.panel.tabIndex = -1;
    this.onResize = () => { if (!this.layer.hidden) this.place(); };
    window.addEventListener('resize', this.onResize, { passive: true });
    this.panel.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch' || window.innerWidth >= 720) return;
      const interactive = event.target.closest('button, a');
      if (!interactive && (this.panel.scrollTop <= 0 || event.target === this.handle)) {
        this.drag = { y: event.clientY, x: event.clientX, pointerId: event.pointerId };
      }
    }, { passive: true });
    this.panel.addEventListener('pointerup', event => this.endSwipe(event), { passive: true });
    this.panel.addEventListener('pointercancel', () => { this.drag = null; });
    // A native scroll may cancel pointer events. Touchend still supplies its endpoint.
    this.panel.addEventListener('touchstart', event => {
      if (window.innerWidth < 720 && this.panel.scrollTop <= 0 && !event.target.closest('button, a')) {
        const touch = event.touches[0];
        this.touchStart = { clientX: touch.clientX, clientY: touch.clientY };
      }
    }, { passive: true });
    this.panel.addEventListener('touchend', event => {
      if (this.touchStart) {
        const end = event.changedTouches[0];
        if (end.clientY - this.touchStart.clientY >= 60
          && Math.abs(end.clientX - this.touchStart.clientX) < 80) this.close();
      }
      this.touchStart = null;
    }, { passive: true });
  }

  open(entry, invoker, release = () => {}) {
    if (!this.layer.hidden) this.close(false);
    this.invoker = invoker;
    this.release = release;
    this.content.replaceChildren();
    const heading = original(entry, 'h2', 'card-word');
    heading.id = 'card-word';
    const roman = element('p', 'roman', entry.roman);
    roman.lang = 'en';
    roman.dir = 'ltr';
    this.content.append(heading, roman, bilingual(entry.langName, 'card-language'),
      bilingual(entry.gloss, 'card-gloss'), relationTag(entry.relation));
    if (entry.note) this.content.append(bilingual(entry.note, 'card-note'));
    this.content.append(bilingual({ zh: '出處', en: 'Sources' }, 'source-heading'), sourceList(entry.sources));
    this.layer.hidden = false;
    this.panel.scrollTop = 0;
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.inertBefore = new Map();
    for (const child of document.body.children) {
      if (child === this.layer || child.tagName === 'SCRIPT') continue;
      this.inertBefore.set(child, child.inert);
      child.inert = true;
    }
    this.place();
    this.closeButton.focus({ preventScroll: true });
    requestAnimationFrame(() => { if (!this.layer.hidden) this.layer.classList.add('is-open'); });
  }

  place() {
    if (window.innerWidth < 720) {
      this.panel.style.removeProperty('left');
      this.panel.style.removeProperty('top');
      return;
    }
    const anchor = this.invoker?.getBoundingClientRect() || {
      left: innerWidth / 2, right: innerWidth / 2, top: innerHeight / 2,
    };
    const width = this.panel.offsetWidth;
    const height = this.panel.offsetHeight;
    let left = anchor.right + 26;
    if (left + width > innerWidth - 20) left = anchor.left - width - 26;
    this.panel.style.left = `${Math.max(20, Math.min(innerWidth - width - 20, left))}px`;
    this.panel.style.top = `${Math.max(20, Math.min(innerHeight - height - 20, anchor.top - 48))}px`;
  }

  onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); this.close(); }
    if (event.key !== 'Tab') return;
    const focusable = [...this.panel.querySelectorAll('button, a[href], [tabindex="0"]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  endSwipe(event) {
    if (this.drag?.pointerId === event.pointerId && event.clientY - this.drag.y >= 60
      && Math.abs(event.clientX - this.drag.x) < 80) this.close();
    this.drag = null;
  }

  close(restore = true) {
    if (this.layer.hidden) return;
    this.layer.classList.remove('is-open');
    this.layer.hidden = true;
    document.body.style.overflow = this.previousOverflow;
    for (const [child, inert] of this.inertBefore) child.inert = inert;
    this.release?.();
    // A floating word lives in an aria-hidden layer: let focus rest instead of ringing it.
    if (restore && this.invoker?.isConnected) {
      if (this.invoker.closest('[aria-hidden="true"]')) document.activeElement?.blur();
      else this.invoker.focus({ preventScroll: true });
    }
    this.drag = null;
    this.touchStart = null;
  }
}
