import { startGlide } from './glide';

const FORM_ID = 'contact-form';
const TEAR_MS = 430;

const motionAllowed = (): boolean => document.documentElement.classList.contains('motion');

const prefillContact = (topic: string, text: string): void => {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  const radio = form.querySelector<HTMLInputElement>(`input[name="topic"][value="${CSS.escape(topic)}"]`);
  if (radio) radio.checked = true;
  const message = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
  if (!message) return;
  const untouched = message.value.trim() === '' || message.value === message.dataset.prefill;
  if (!untouched) return;
  message.value = text ? `${text}\n` : '';
  message.dataset.prefill = message.value;
  message.dispatchEvent(new Event('input', { bubbles: true }));
};

const goToForm = (): void => {
  startGlide();
  if (location.hash === `#${FORM_ID}`) document.getElementById(FORM_ID)?.scrollIntoView();
  else location.hash = FORM_ID;
};

const tearOff = (strip: HTMLElement): void => {
  strip.classList.add('is-torn');
  strip.closest('li')?.classList.add('has-torn');
  window.setTimeout(goToForm, TEAR_MS);
};

const bindStrip = (strip: HTMLAnchorElement): void => {
  strip.addEventListener('click', (event) => {
    prefillContact(strip.dataset.topic ?? 'project', strip.dataset.prefill ?? '');
    const byPointer = event.detail > 0;
    if (!byPointer || !motionAllowed()) return;
    event.preventDefault();
    tearOff(strip);
  });
};

export const initFlyers = (): void => {
  document.querySelectorAll<HTMLAnchorElement>('[data-flyer] [data-strip]').forEach(bindStrip);
};
