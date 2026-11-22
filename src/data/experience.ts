export type StationId = 'cml' | 'latinoapuesta' | 'intercom' | 'freelance';
export type Lane = 'main' | 'branch';

export interface Station {
  id: StationId;
  from: number;
  to: number | null;
  lane: Lane;
}

export const CAREER_START = 2021;

const month = (year: number, monthNumber: number): number => year + (monthNumber - 1) / 12;

export const STATIONS: readonly Station[] = [
  { id: 'cml', from: month(2021, 1), to: month(2025, 1), lane: 'main' },
  { id: 'latinoapuesta', from: month(2022, 6), to: month(2023, 2), lane: 'branch' },
  { id: 'intercom', from: month(2025, 1), to: null, lane: 'main' },
  { id: 'freelance', from: month(2026, 3), to: null, lane: 'branch' },
];
