import { easeToward, isSettled, stepSpring } from './spring';

const FLING_PROJECTION_SECONDS = 0.2;
const MAX_FLING_SLIDES = 1;
const MIN_SCROLL_TRAVEL = 0.12;
const FULL_LIFT_SPEED = 5;
const LIFT_SECONDS = 0.12;
const HELD_VELOCITY_SECONDS = 0.05;
const REST_LIFT = 0.002;

export class RingMotion {
  position: number;
  velocity = 0;
  lift = 0;
  private target: number;
  private held = false;
  private heldFrom = 0;
  private lastHeldPosition = 0;
  private scrolling = false;
  private scrollFrom = 0;

  constructor(start: number) {
    this.position = this.target = start;
  }

  get nearest(): number {
    return Math.round(this.position);
  }

  moveTo(target: number): void {
    this.target = target;
  }

  stepBy(direction: number): void {
    this.target = Math.round(this.target) + direction;
  }

  grab(): void {
    this.heldFrom = this.target = this.position;
    this.velocity = 0;
  }

  dragBy(slides: number): void {
    if (!this.held) this.lastHeldPosition = this.position;
    this.held = true;
    this.position = this.target = this.heldFrom - slides;
  }

  release(): void {
    if (!this.held) {
      this.target = this.nearest;
      return;
    }
    this.held = false;
    const projected = Math.round(this.position + this.velocity * FLING_PROJECTION_SECONDS);
    this.target = Math.max(this.nearest - MAX_FLING_SLIDES, Math.min(this.nearest + MAX_FLING_SLIDES, projected));
  }

  scrollBy(slides: number): void {
    if (!this.scrolling) this.scrollFrom = Math.round(this.target);
    this.scrolling = true;
    this.target += slides;
  }

  endScroll(): void {
    if (!this.scrolling) return;
    this.scrolling = false;
    const travelled = this.target - this.scrollFrom;
    const snapped = Math.round(this.target);
    const stayed = snapped === this.scrollFrom && Math.abs(travelled) > MIN_SCROLL_TRAVEL;
    this.target = stayed ? snapped + Math.sign(travelled) : snapped;
  }

  advance(elapsedSeconds: number): boolean {
    if (this.held) this.followHand(elapsedSeconds);
    else ({ value: this.position, velocity: this.velocity } = stepSpring({ value: this.position, velocity: this.velocity }, this.target, elapsedSeconds));

    const liftGoal = this.held ? 1 : Math.min(1, Math.abs(this.velocity) / FULL_LIFT_SPEED);
    this.lift = easeToward(this.lift, liftGoal, elapsedSeconds, LIFT_SECONDS);

    if (this.held || this.scrolling || this.lift > REST_LIFT || !isSettled({ value: this.position, velocity: this.velocity }, this.target)) return true;
    this.rest();
    return false;
  }

  private followHand(elapsedSeconds: number): void {
    const measured = (this.position - this.lastHeldPosition) / elapsedSeconds;
    this.velocity = easeToward(this.velocity, measured, elapsedSeconds, HELD_VELOCITY_SECONDS);
    this.lastHeldPosition = this.position;
  }

  private rest(): void {
    this.position = this.target;
    this.velocity = 0;
    this.lift = 0;
  }
}
