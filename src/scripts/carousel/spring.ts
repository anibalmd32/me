export interface SpringState {
  value: number;
  velocity: number;
}

const STIFFNESS = 150;
const DAMPING = 20;
const MAX_SUBSTEP_SECONDS = 0.008;
const REST_DISTANCE = 0.0005;
const REST_VELOCITY = 0.005;

export const stepSpring = (state: SpringState, target: number, elapsedSeconds: number): SpringState => {
  const substeps = Math.max(1, Math.ceil(elapsedSeconds / MAX_SUBSTEP_SECONDS));
  const step = elapsedSeconds / substeps;
  let { value, velocity } = state;
  for (let i = 0; i < substeps; i += 1) {
    velocity += ((target - value) * STIFFNESS - velocity * DAMPING) * step;
    value += velocity * step;
  }
  return { value, velocity };
};

export const isSettled = (state: SpringState, target: number): boolean =>
  Math.abs(target - state.value) < REST_DISTANCE && Math.abs(state.velocity) < REST_VELOCITY;

export const easeToward = (current: number, goal: number, elapsedSeconds: number, timeConstantSeconds: number): number =>
  current + (goal - current) * (1 - Math.exp(-elapsedSeconds / timeConstantSeconds));
