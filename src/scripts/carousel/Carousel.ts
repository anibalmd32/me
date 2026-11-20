import { signedOffset, wrapIndex } from './geometry';
import { bindDrag } from './drag';
import { bindWheel } from './wheel';
import { recallSlug, rememberSlug } from './memory';
import { RingMotion } from './RingMotion';
import { SlidePlayback } from './playback';

const ARC_PER_SLIDE = 0.8;
const FULL_SWAY_SPEED = 6;
const TRAIL_PER_SLIDE = 0.09;
const MAX_FRAME_SECONDS = 0.064;

export class Carousel {
  private frameRequest = 0;
  private lastTick = 0;
  private activeIndex = -1;
  private readonly motion: RingMotion;
  private readonly playback: SlidePlayback;

  constructor(
    private readonly root: HTMLElement,
    private readonly slides: HTMLElement[],
  ) {
    this.playback = new SlidePlayback(root, slides);
    const remembered = slides.findIndex((slide) => slide.dataset.slug === recallSlug());
    this.motion = new RingMotion(Math.max(0, remembered));
    root.classList.add('is-3d');
    root.querySelector<HTMLElement>('[data-carousel-controls]')?.removeAttribute('hidden');
    this.bindControls();
    this.bindSlides();
    this.render();
  }

  private get total(): number {
    return this.slides.length;
  }

  private get slidePx(): number {
    const slide = this.slides[0];
    const card = slide?.querySelector<HTMLElement>('[data-slide-card]')?.offsetWidth;
    const frame = slide?.querySelector<HTMLElement>('[data-slide-frame]')?.offsetWidth;
    return (card || frame || 600) * ARC_PER_SLIDE;
  }

  goTo(index: number): void {
    const from = this.motion.nearest;
    this.motion.moveTo(from + signedOffset(index, from, this.total));
    this.animate();
  }

  step(direction: number): void {
    this.motion.stepBy(direction);
    this.animate();
  }

  private bindControls(): void {
    this.root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => this.step(-1));
    this.root.querySelector('[data-carousel-next]')?.addEventListener('click', () => this.step(1));
    this.root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') this.step(-1);
      else if (event.key === 'ArrowRight') this.step(1);
    });
    bindWheel(this.root, {
      onScroll: (deltaPx) => this.drive(() => this.motion.scrollBy(deltaPx / this.slidePx)),
      onEnd: () => this.drive(() => this.motion.endScroll()),
    });
    const track = this.root.querySelector<HTMLElement>('[data-carousel-track]');
    if (track) bindDrag(track, this.dragHandlers());
  }

  private bindSlides(): void {
    this.slides.forEach((slide, index) => {
      slide.querySelector('[data-slide-card]')?.addEventListener('click', (event) => {
        if (index === this.activeIndex) return;
        event.preventDefault();
        this.goTo(index);
      });
      slide.querySelectorAll('a[href]').forEach((link) =>
        link.addEventListener('click', () => rememberSlug(slide.dataset.slug ?? '')),
      );
    });
  }

  private dragHandlers() {
    return {
      onStart: () => this.drive(() => this.motion.grab()),
      onMove: (deltaPx: number) => {
        this.root.classList.add('is-dragging');
        this.drive(() => this.motion.dragBy(deltaPx / this.slidePx));
      },
      onEnd: () => {
        this.root.classList.remove('is-dragging');
        this.drive(() => this.motion.release());
      },
    };
  }

  private drive(change: () => void): void {
    change();
    this.animate();
  }

  private animate(): void {
    if (this.frameRequest) return;
    this.lastTick = performance.now();
    this.frameRequest = requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number): void => {
    const elapsedSeconds = Math.min(MAX_FRAME_SECONDS, Math.max(0.001, (now - this.lastTick) / 1000));
    this.lastTick = now;
    const moving = this.motion.advance(elapsedSeconds);
    this.render();
    this.frameRequest = moving ? requestAnimationFrame(this.tick) : 0;
  };

  private render(): void {
    const { position, velocity, lift } = this.motion;
    const sway = Math.max(-1, Math.min(1, velocity / FULL_SWAY_SPEED));
    this.root.style.setProperty('--sway', sway.toFixed(4));
    this.root.style.setProperty('--lift', lift.toFixed(4));
    this.slides.forEach((slide, index) => {
      const rigid = signedOffset(index, position, this.total);
      const offset = rigid + sway * TRAIL_PER_SLIDE * Math.abs(rigid);
      const distance = Math.abs(offset);
      slide.style.setProperty('--d', offset.toFixed(4));
      slide.style.setProperty('--ad', distance.toFixed(4));
      slide.style.setProperty('--z', String(100 - Math.round(distance * 10)));
    });
    this.setActive(wrapIndex(Math.round(position), this.total));
  }

  private setActive(index: number): void {
    if (index === this.activeIndex) return;
    this.activeIndex = index;
    this.slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.querySelector<HTMLElement>('[data-slide-caption]')?.toggleAttribute('inert', !active);
    });
    this.announce(index);
    this.playback.activate(index);
  }

  private announce(index: number): void {
    const label = this.root.dataset.slideLabel ?? '{n} / {total}';
    const position = label.replace('{n}', String(index + 1)).replace('{total}', String(this.total));
    const title = this.slides[index]?.querySelector('.slide__title a')?.textContent?.trim() ?? '';
    const current = this.root.querySelector('[data-carousel-current]');
    const status = this.root.querySelector('[data-carousel-status]');
    if (current) current.textContent = String(index + 1);
    if (status) status.textContent = `${title}, ${position}`;
  }
}
