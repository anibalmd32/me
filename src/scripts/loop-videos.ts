const motionAllowed = (): boolean => document.documentElement.classList.contains('motion');

class LoopVideo {
  private visible = false;
  private userInControl = false;
  private pausingOnItsOwn = false;

  constructor(private readonly video: HTMLVideoElement) {
    video.addEventListener('pause', () => {
      if (!this.pausingOnItsOwn) this.userInControl = true;
      this.pausingOnItsOwn = false;
    });
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.sync();
  }

  sync(): void {
    if (this.userInControl || document.fullscreenElement === this.video) return;
    const shouldPlay = this.visible && document.visibilityState === 'visible';
    if (shouldPlay) void this.video.play().catch(() => undefined);
    else if (!this.video.paused) {
      this.pausingOnItsOwn = true;
      this.video.pause();
    }
  }
}

export const initLoopVideos = (): void => {
  if (!motionAllowed()) return;
  const players = new Map<Element, LoopVideo>();
  document.querySelectorAll<HTMLVideoElement>('[data-loop-video]').forEach((video) => {
    if (!video.closest('[data-carousel]')) players.set(video, new LoopVideo(video));
  });
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => players.get(entry.target)?.setVisible(entry.isIntersecting)),
    { threshold: 0.25 },
  );
  players.forEach((_, video) => observer.observe(video));
  document.addEventListener('visibilitychange', () => players.forEach((player) => player.sync()));
};
