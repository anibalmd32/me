import type { ToolId } from './skills';

export interface Place {
  id: string;
  name: string;
  from: number;
  to: number | null;
  tools: readonly ToolId[];
}

const month = (year: number, monthNumber: number): number => year + (monthNumber - 1) / 12;

export const TIMELINE_START = 2021;

export const PLACES: readonly Place[] = [
  { id: 'cml', name: 'CML Exports', from: month(2021, 1), to: month(2025, 1), tools: ['stripe'] },
  { id: 'latinoapuesta', name: 'Latinoapuesta', from: month(2022, 6), to: month(2023, 2), tools: ['django', 'htmx'] },
  {
    id: 'intercom',
    name: 'Intercomwws',
    from: month(2025, 1),
    to: null,
    tools: ['php', 'laravel', 'mysql', 'postgresql', 'redis', 'stripe', 'sumsub', 'websockets', 'typescript', 'react', 'nextjs', 'express', 'tailwind', 'mcp', 'git', 'docker', 'actions', 'pest', 'vitest'],
  },
  {
    id: 'telemedicine',
    name: 'Telemedicine',
    from: month(2026, 3),
    to: month(2026, 6),
    tools: ['typescript', 'express', 'postgresql', 'stripe', 'twilio', 'whatsapp', 'websockets', 'react', 'nextjs', 'tailwind', 'llm', 'assistants', 'git', 'actions'],
  },
  {
    id: 'apartar',
    name: 'Apartar',
    from: month(2026, 10),
    to: null,
    tools: ['php', 'laravel', 'inertia', 'react', 'typescript', 'tailwind', 'mysql', 'redis', 'websockets', 'llm', 'git', 'docker', 'actions', 'pest', 'vitest'],
  },
  {
    id: 'ia-grades-loader',
    name: 'IA Grades Loader',
    from: month(2026, 10),
    to: month(2026, 12),
    tools: ['python', 'fastapi', 'mysql', 'mcp', 'llm', 'assistants', 'react', 'typescript', 'tauri', 'tailwind', 'git', 'docker', 'actions', 'vitest'],
  },
  {
    id: 'minicajero',
    name: 'MiniCajero',
    from: month(2026, 11),
    to: month(2026, 12),
    tools: ['typescript', 'sqlite', 'websockets', 'git'],
  },
  {
    id: 'reposcope',
    name: 'RepoScope',
    from: month(2026, 11),
    to: month(2026, 12),
    tools: ['astro', 'typescript', 'postgresql', 'llm', 'tailwind', 'git'],
  },
  {
    id: 'orquesta',
    name: 'Orquesta',
    from: month(2026, 11),
    to: month(2026, 12),
    tools: ['nestjs', 'hono', 'htmx', 'typescript', 'mysql', 'tailwind', 'git', 'docker'],
  },
];
