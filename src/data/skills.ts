export const SKILL_GROUPS = [
  { id: 'languages', tools: ['typescript', 'javascript', 'php', 'python', 'sql'] },
  { id: 'backend', tools: ['laravel', 'nodejs', 'nestjs', 'express', 'hono', 'fastapi', 'django'] },
  { id: 'frontend', tools: ['react', 'nextjs', 'inertia', 'astro', 'angular', 'htmx', 'tailwind', 'tauri'] },
  { id: 'data', tools: ['mysql', 'postgresql', 'sqlite', 'redis', 'mongodb'] },
  { id: 'realtime', tools: ['websockets', 'sse', 'stripe', 'sumsub', 'twilio', 'whatsapp'] },
  { id: 'ai', tools: ['llm', 'mcp', 'assistants'] },
  { id: 'tooling', tools: ['git', 'docker', 'actions', 'pest', 'vitest'] },
] as const;

export type SkillGroup = (typeof SKILL_GROUPS)[number];
export type GroupId = SkillGroup['id'];
export type ToolId = SkillGroup['tools'][number];

export const IMPLIED_TOOLS: Partial<Record<ToolId, readonly ToolId[]>> = {
  typescript: ['javascript'],
  django: ['python'],
  mysql: ['sql'],
  postgresql: ['sql'],
  sqlite: ['sql'],
  express: ['nodejs'],
  nextjs: ['nodejs'],
};
