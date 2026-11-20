import { SkillsMap } from './SkillsMap';

export const initSkillsMaps = (): void => {
  document.querySelectorAll<HTMLElement>('[data-skills]').forEach((root) => new SkillsMap(root));
};
