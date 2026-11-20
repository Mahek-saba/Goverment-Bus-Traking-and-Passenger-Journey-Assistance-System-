import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, supportedLanguages, defaultLanguage } from '../locales';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'msrtc_passenger_lang';
const FONT_STORAGE_KEY = 'msrtc_font_size';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        return saved;
      }
    } catch (e) {
      // Ignore localStorage read errors
    }
    return defaultLanguage;
  });

  const [fontSize, setFontSizeState] = useState(() => {
    try {
      const saved = localStorage.getItem(FONT_STORAGE_KEY);
      if (saved && ['small', 'normal', 'large'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // Ignore
    }
    return 'normal';
  });

  // Sync HTML font size whenever fontSize changes
  useEffect(() => {
    try {
      if (fontSize === 'large') {
        document.documentElement.style.fontSize = '112%';
      } else if (fontSize === 'small') {
        document.documentElement.style.fontSize = '92%';
      } else {
        document.documentElement.style.fontSize = '100%';
      }
      localStorage.setItem(FONT_STORAGE_KEY, fontSize);
    } catch (e) {
      // Ignore
    }
  }, [fontSize]);

  const setFontSize = useCallback((size) => {
    if (['small', 'normal', 'large'].includes(size)) {
      setFontSizeState(size);
    }
  }, []);

  const increaseFontSize = useCallback(() => setFontSizeState('large'), []);
  const decreaseFontSize = useCallback(() => setFontSizeState('small'), []);
  const resetFontSize = useCallback(() => setFontSizeState('normal'), []);

  // Sync HTML lang attribute whenever language changes
  useEffect(() => {
    try {
      document.documentElement.lang = language;
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      // Ignore
    }
  }, [language]);

  const changeLanguage = useCallback((newLang) => {
    if (newLang === 'en' || newLang === 'hi' || newLang === 'mr') {
      setLanguage(newLang);
    }
  }, []);

  // Central translation resolver
  const t = useCallback((path, params = {}) => {
    if (!path) return '';

    const getNestedValue = (obj, keyPath) => {
      const keys = keyPath.split('.');
      let current = obj;
      for (const k of keys) {
        if (current === undefined || current === null || typeof current !== 'object') {
          return undefined;
        }
        current = current[k];
      }
      return current;
    };

    // 1. Check current language
    let text = getNestedValue(translations[language], path);

    // 2. Fall back to English
    if (text === undefined && language !== 'en') {
      text = getNestedValue(translations.en, path);
    }

    // 3. Fall back to path key itself
    if (text === undefined) {
      return path;
    }

    // 4. Handle interpolation if text is a string
    if (typeof text === 'string' && Object.keys(params).length > 0) {
      return text.replace(/\{(\w+)\}/g, (_, key) => {
        return params[key] !== undefined ? params[key] : `{${key}}`;
      });
    }

    return text;
  }, [language]);

  const currentLanguageMeta = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        supportedLanguages,
        currentLanguageMeta,
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
