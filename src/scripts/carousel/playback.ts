export class SlidePlayback {
  private visible = false;
  private activeIndex = 0;

  constructor(
    root: HTMLElement,
    private readonly slides: HTMLElement[],
  ) {
    new IntersectionObserver(
      ([entry]) => {
        this.visible = entry?.isIntersecting ?? false;
        this.sync();
      },
      { threshold: 0.35 },
    ).observe(root);
    document.addEventListener('visibilitychange', () => this.sync());
  }

  activate(index: number): void {
    this.activeIndex = index;
    this.sync();
  }

  private sync(): void {
    const playing = this.visible && document.visibilityState === 'visible';
    this.slides.forEach((slide, index) => {
      const video = slide.querySelector('video');
      if (!video) return;
      if (playing && index === this.activeIndex) void video.play().catch(() => undefined);
      else video.pause();
    });
  }
}
