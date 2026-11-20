import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';

export const translations = {
  en,
  hi,
  mr
};

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
];

export const defaultLanguage = 'en';

export default translations;
