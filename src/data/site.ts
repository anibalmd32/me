/**
 * Site-wide facts. Edit here; nothing in this file is rendered as-is
 * without going through the i18n dictionaries.
 */
export const SITE = {
  url: 'https://anibalmendoza.dev',
  name: 'Anibal Mendoza',
  handle: '@anibalmd32',
  location: 'Apure, Venezuela',

  /**
   * CV download. Off by default: the PDFs in src/assets/cv include a phone
   * number and an email address, and the site promises to show neither.
   * Replace them with versions without contact details, then set this to
   * true: the hero gets its "Download CV" button back and the files are
   * published at the URLs below (see src/pages/assets/cv/[file].pdf.ts).
   */
  cvDownload: false,
  cv: {
    en: '/assets/cv/cv_anibal_en.pdf',
    es: '/assets/cv/cv_anibal_es.pdf',
  },

  /** Public profiles. Leave a value empty to hide that link. */
  socials: {
    github: 'https://github.com/anibalmd32',
    linkedin: '',
    instagram: '',
    youtube: '',
    tiktok: '',
  },

  /**
   * Contact form backend. The address that receives the messages lives in
   * the form service, never in this repository or in the page.
   * Set PUBLIC_CONTACT_ENDPOINT in .env (see .env.example).
   */
  contactEndpoint: import.meta.env.PUBLIC_CONTACT_ENDPOINT ?? '',
  contactAccessKey: import.meta.env.PUBLIC_CONTACT_ACCESS_KEY ?? '',
} as const;

export type Lang = 'en' | 'es';
export const LANGS: Lang[] = ['en', 'es'];
export const DEFAULT_LANG: Lang = 'en';
