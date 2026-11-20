const KEY = 'projects:active';

export const rememberSlug = (slug: string): void => {
  try {
    sessionStorage.setItem(KEY, slug);
  } catch {
    return;
  }
};

export const recallSlug = (): string | null => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};
