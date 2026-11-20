type DragHandlers = {
  onStart: () => void;
  onMove: (deltaPx: number) => void;
  onEnd: () => void;
};

const CLICK_TOLERANCE_PX = 6;

export const bindDrag = (surface: HTMLElement, handlers: DragHandlers): void => {
  let startX = 0;
  let pointerId: number | null = null;
  let moved = false;

  surface.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    moved = false;
    handlers.onStart();
  });

  surface.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    const delta = event.clientX - startX;
    if (!moved && Math.abs(delta) > CLICK_TOLERANCE_PX) {
      moved = true;
      startX = event.clientX;
      surface.setPointerCapture(event.pointerId);
      return;
    }
    if (moved) handlers.onMove(delta);
  });

  const finish = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    handlers.onEnd();
  };

  surface.addEventListener('pointerup', finish);
  surface.addEventListener('pointercancel', finish);

  surface.addEventListener(
    'click',
    (event) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    },
    true,
  );
};
