import { CAREER_START, STATIONS, type Lane, type Station, type StationId } from '@/data/experience';
import { sketchLine } from './sketch';

const WIDTH = 1000;
const HEIGHT = 100;
const AXIS_Y = 50;
const BRANCH_Y = 70;
const FORK_RUN = 14;
const TODAY_AT = 0.9;
const TICK_HALF = 4;
const LINE_ROUGHNESS = 0.15;

export interface RouteStop {
  id: StationId;
  lane: Lane;
  year: number;
  dotLeft: number;
  penStop: number;
  ongoing: boolean;
}

export interface RouteBranch {
  index: number;
  ink: string;
  pen: string;
}

export interface Route {
  viewBox: string;
  pencil: string;
  mainInk: string[];
  ticks: string[];
  todayLine: string;
  todayLeft: number;
  pen: string;
  branches: RouteBranch[];
  openLanes: Lane[];
  stops: RouteStop[];
}

const yearFraction = (date: Date): number => {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const nextYearStart = Date.UTC(date.getUTCFullYear() + 1, 0, 1);
  return date.getUTCFullYear() + (date.getTime() - yearStart) / (nextYearStart - yearStart);
};

const n = (value: number): string => value.toFixed(1);
const percent = (x: number): number => Number(((x / WIDTH) * 100).toFixed(2));

const forkDown = (x: number): string =>
  `M ${n(x)} ${AXIS_Y} C ${n(x + FORK_RUN * 0.6)} ${AXIS_Y} ${n(x + FORK_RUN * 0.4)} ${BRANCH_Y} ${n(x + FORK_RUN)} ${BRANCH_Y}`;

const mergeUp = (x: number): string =>
  `C ${n(x - FORK_RUN * 0.4)} ${BRANCH_Y} ${n(x - FORK_RUN * 0.6)} ${AXIS_Y} ${n(x)} ${AXIS_Y}`;

const branchInk = (startX: number, endX: number, returns: boolean): string =>
  returns
    ? `${forkDown(startX)} L ${n(endX - FORK_RUN)} ${BRANCH_Y} ${mergeUp(endX)}`
    : `${forkDown(startX)} L ${n(endX)} ${BRANCH_Y}`;

export const buildRoute = (now: Date): Route => {
  const today = yearFraction(now);
  const todayX = WIDTH * TODAY_AT;
  const xOf = (time: number): number => ((time - CAREER_START) / (today - CAREER_START)) * todayX;
  const endX = (station: Station): number => (station.to === null ? todayX : xOf(station.to));

  const mainInk = STATIONS.filter((station) => station.lane === 'main').map((station) =>
    sketchLine([xOf(station.from), AXIS_Y], [endX(station), AXIS_Y], `route-${station.id}`, LINE_ROUGHNESS),
  );

  const branches = STATIONS.flatMap((station, index) =>
    station.lane === 'branch'
      ? [{ index, ink: branchInk(xOf(station.from), endX(station), station.to !== null), pen: forkDown(xOf(station.from)) }]
      : [],
  );

  const firstTickYear = CAREER_START + 1;
  const ticks = Array.from({ length: Math.max(0, Math.floor(today) - firstTickYear + 1) }, (_, index) => {
    const x = xOf(firstTickYear + index);
    return `M ${n(x)} ${AXIS_Y - TICK_HALF} L ${n(x)} ${AXIS_Y + TICK_HALF}`;
  });

  const stops = STATIONS.map((station) => {
    const startX = xOf(station.from);
    return {
      id: station.id,
      lane: station.lane,
      year: Math.floor(station.from),
      dotLeft: percent(station.lane === 'branch' ? startX + FORK_RUN : startX),
      penStop: Number((startX / todayX).toFixed(4)),
      ongoing: station.to === null,
    };
  });

  return {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    pencil: `M 0 ${AXIS_Y} L ${WIDTH} ${AXIS_Y}`,
    mainInk,
    ticks,
    todayLine: sketchLine([todayX, 16], [todayX, 90], 'route-today', LINE_ROUGHNESS),
    todayLeft: percent(todayX),
    pen: `M 0 ${AXIS_Y} L ${n(todayX)} ${AXIS_Y}`,
    branches,
    openLanes: STATIONS.filter((station) => station.to === null).map((station) => station.lane),
    stops,
  };
};
