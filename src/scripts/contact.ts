/**
 * Contact form: validates in the page, then posts to the form service
 * configured in PUBLIC_CONTACT_ENDPOINT. The inbox address lives in that
 * service; it never reaches the browser.
 */

type FieldName = 'name' | 'email' | 'message';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTMARK_MS = 1150;

const motionAllowed = () => document.documentElement.classList.contains('motion');

const postmarkDate = () =>
  new Intl.DateTimeFormat(document.documentElement.lang || 'en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

const rules: Record<FieldName, (value: string) => boolean> = {
  message: (v) => v.trim().length >= 20,
  name: (v) => v.trim().length >= 2,
  email: (v) => EMAIL.test(v.trim()),
};

export function initContact() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const success = document.querySelector<HTMLElement>('[data-form-success]');
  const again = document.querySelector<HTMLButtonElement>('[data-form-again]');
  const endpoint = form.dataset.endpoint ?? '';
  const text = {
    sending: form.dataset.sending ?? '',
    submit: submitLabel?.textContent ?? '',
    error: form.dataset.error ?? '',
    notConfigured: form.dataset.notConfigured ?? '',
  };

  // The page validates with its own messages; native bubbles stay as the no-JS fallback.
  form.noValidate = true;

  const field = (name: FieldName) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
  const errorEl = (name: FieldName) => form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);

  const check = (name: FieldName) => {
    const input = field(name);
    const ok = rules[name](input.value);
    input.setAttribute('aria-invalid', String(!ok));
    const error = errorEl(name);
    if (error) error.hidden = ok;
    return ok;
  };

  (Object.keys(rules) as FieldName[]).forEach((name) => {
    const input = field(name);
    input.addEventListener('blur', () => {
      if (input.value) check(name);
    });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') check(name);
    });
  });

  const say = (message: string, bad = false) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-bad', bad);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    say('');

    const results = (Object.keys(rules) as FieldName[]).map((name) => ({ name, ok: check(name) }));
    const firstBad = results.find((r) => !r.ok);
    if (firstBad) {
      field(firstBad.name).focus();
      return;
    }

    if (!endpoint) {
      // Visitors get a plain sentence; the fix is for whoever deploys the site.
      console.warn('Contact form: set PUBLIC_CONTACT_ENDPOINT (see .env.example) to connect it to an inbox.');
      say(text.notConfigured, true);
      return;
    }

    const data = new FormData(form);
    // Honeypot: real people never fill this one.
    if (data.get('_gotcha')) return;

    if (submit) submit.disabled = true;
    if (submitLabel) submitLabel.textContent = text.sending;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      if (!response.ok) throw new Error(String(response.status));
      const date = form.querySelector<SVGTextElement>('[data-postmark-date]');
      if (date) date.textContent = postmarkDate();
      form.classList.add('is-posted');
      await new Promise((resolve) => setTimeout(resolve, motionAllowed() ? POSTMARK_MS : 0));
      form.hidden = true;
      form.classList.remove('is-posted');
      if (success) {
        success.hidden = false;
        success.focus();
      }
      form.reset();
    } catch {
      say(text.error, true);
    } finally {
      if (submit) submit.disabled = false;
      if (submitLabel) submitLabel.textContent = text.submit;
    }
  });

  again?.addEventListener('click', () => {
    if (success) success.hidden = true;
    form.hidden = false;
    field('name').focus();
  });
}
