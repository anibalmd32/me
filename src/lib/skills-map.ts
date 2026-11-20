import { PLACES, TIMELINE_START, type Place } from '@/data/places';
import { IMPLIED_TOOLS, type ToolId } from '@/data/skills';

const SHORT_STAY_YEARS = 0.25;

export interface TimelineRow {
  place: Place;
  tools: ToolId[];
  start: number;
  end: number;
  ongoing: boolean;
  brief: boolean;
  firstYear: number;
  lastYear: number;
}

export interface Timeline {
  years: number[];
  today: number;
  rows: TimelineRow[];
}

export const toolsOf = (place: Place): ToolId[] => [
  ...new Set(place.tools.flatMap((tool) => [tool, ...(IMPLIED_TOOLS[tool] ?? [])])),
];

export const placesOf = (tool: ToolId): Place[] => PLACES.filter((place) => toolsOf(place).includes(tool));

const yearFraction = (date: Date): number => {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const nextYearStart = Date.UTC(date.getUTCFullYear() + 1, 0, 1);
  return date.getUTCFullYear() + (date.getTime() - yearStart) / (nextYearStart - yearStart);
};

export const buildTimeline = (now: Date): Timeline => {
  const today = yearFraction(now);
  const endYear = Math.floor(today) + 1;
  const span = endYear - TIMELINE_START;
  const share = (value: number): number => (value - TIMELINE_START) / span;

  const rows = PLACES.map((place) => {
    const until = place.to ?? today;
    return {
      place,
      tools: toolsOf(place),
      start: share(place.from),
      end: share(until),
      ongoing: place.to === null,
      brief: until - place.from < SHORT_STAY_YEARS,
      firstYear: Math.floor(place.from),
      lastYear: Math.floor(until - 1 / 24),
    };
  });

  return {
    years: Array.from({ length: span }, (_, index) => TIMELINE_START + index),
    today: share(today),
    rows,
  };
};
