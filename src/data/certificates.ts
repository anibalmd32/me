import type { ImageMetadata } from 'astro';
import architecture from '@/assets/certificates/architecture.jpg';
import ai from '@/assets/certificates/ai.jpg';
import webPath from '@/assets/certificates/web-path.jpg';

export const DIPLOMA_IMAGES: Record<string, ImageMetadata> = {
  architecture,
  ai,
  'web-path': webPath,
};
