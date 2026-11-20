type WheelHandlers = {
  onScroll: (deltaPx: number) => void;
  onEnd: () => void;
};

const IDLE_MS = 140;
const LINE_PX = 16;

export const bindWheel = (surface: HTMLElement, handlers: WheelHandlers): void => {
  let idleTimer = 0;

  surface.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? LINE_PX : 1;
      handlers.onScroll(event.deltaX * unit);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(handlers.onEnd, IDLE_MS);
    },
    { passive: false },
  );
};
