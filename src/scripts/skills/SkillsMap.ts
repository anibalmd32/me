import { bindRovingFocus } from './roving';

const PLACE_SEPARATOR = ' · ';

export class SkillsMap {
  private picked: HTMLElement | null = null;
  private readonly items: HTMLElement[];
  private readonly notes: HTMLElement[];
  private readonly status: HTMLElement | null;

  constructor(private readonly root: HTMLElement) {
    this.items = [...root.querySelectorAll<HTMLElement>('[data-pick]')];
    this.notes = [...root.querySelectorAll<HTMLElement>('[data-where]')];
    this.status = root.querySelector<HTMLElement>('[data-skills-status]');
    this.items.forEach((item) => item.addEventListener('click', () => this.toggle(item)));
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.toggle(this.picked);
    });
    bindRovingFocus(this.ofKind('tool'));
    bindRovingFocus(this.ofKind('place'));
  }

  private ofKind(kind: string): HTMLElement[] {
    return this.items.filter((item) => item.dataset.kind === kind);
  }

  private toggle(item: HTMLElement | null): void {
    this.picked = item === this.picked ? null : item;
    this.render();
  }

  private linkedTo(picked: HTMLElement | null): HTMLElement[] {
    if (!picked) return [];
    const ids = new Set((picked.dataset.links ?? '').split(' ').filter(Boolean));
    return this.items.filter((item) => item.dataset.kind !== picked.dataset.kind && ids.has(item.dataset.id ?? ''));
  }

  private render(): void {
    const linked = this.linkedTo(this.picked);
    const names = linked.map((item) => item.dataset.name ?? '');
    this.root.classList.toggle('has-pick', this.picked !== null);
    this.items.forEach((item) => {
      item.classList.toggle('is-picked', item === this.picked);
      item.classList.toggle('is-linked', linked.includes(item));
      item.setAttribute('aria-pressed', String(item === this.picked));
    });
    this.showNote(names);
    if (this.status) this.status.textContent = this.picked ? `${this.picked.dataset.name}: ${names.join(', ')}` : '';
  }

  private showNote(placeNames: string[]): void {
    const ownNote = this.picked?.dataset.kind === 'tool' ? this.picked.closest('[data-group]')?.querySelector<HTMLElement>('[data-where]') : null;
    this.notes.forEach((note) => {
      note.hidden = note !== ownNote;
    });
    const text = ownNote?.querySelector<HTMLElement>('[data-where-text]');
    if (text) text.textContent = placeNames.join(PLACE_SEPARATOR);
  }
}
