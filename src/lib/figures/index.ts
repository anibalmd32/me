import type { GroupId } from '@/data/skills';
import { bookShape } from './book';
import { bubbleShape } from './bubble';
import { chipShape } from './chip';
import { databaseShape } from './database';
import { monitorShape } from './monitor';
import { phoneShape } from './phone';
import { receiptShape } from './receipt';
import { serverShape } from './server';
import { toolboxShape } from './toolbox';
import type { FigureShape, FigureSize } from './types';

export type FigureId = GroupId | 'spoken';

export const SHELF_WIDTH = 1248;

const TALL_ROW = 286;
const WIDE_ROW = 240;

const FIGURES: Record<FigureId, { size: FigureSize; draw: (size: FigureSize, items: number) => FigureShape }> = {
  languages: { size: { width: 236, height: TALL_ROW }, draw: bookShape },
  backend: { size: { width: 256, height: TALL_ROW }, draw: serverShape },
  data: { size: { width: 236, height: TALL_ROW }, draw: databaseShape },
  realtime: { size: { width: 244, height: TALL_ROW }, draw: receiptShape },
  apps: { size: { width: 148, height: TALL_ROW }, draw: phoneShape },
  frontend: { size: { width: 304, height: WIDE_ROW }, draw: monitorShape },
  ai: { size: { width: 288, height: WIDE_ROW }, draw: chipShape },
  tooling: { size: { width: 304, height: WIDE_ROW }, draw: toolboxShape },
  spoken: { size: { width: 256, height: WIDE_ROW }, draw: bubbleShape },
};

export const figureFor = (id: FigureId, items: number): FigureShape => FIGURES[id].draw(FIGURES[id].size, items);

export type { FigureShape };
