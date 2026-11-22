export type FigureLayout = 'column' | 'grid' | 'wrap' | 'rows';

export interface FigureSize {
  width: number;
  height: number;
}

export interface FigureInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface FigureShape extends FigureSize {
  markup: string;
  content: FigureInsets;
  layout: FigureLayout;
  labelHeight?: number;
  rowHeight?: number;
  centered?: boolean;
  middle?: boolean;
}

export const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

export const n = (value: number): string => String(Number(value.toFixed(1)));
