'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_LOCALE,
  messagesByLocale,
  type AppLocale,
} from './messages';
import { LOCALE_STORAGE_KEY } from './storage-keys';
import type { MessagePath } from './paths';
import { getStringAtPath, interpolate } from './translate';

function readStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (raw === 'en-US' || raw === 'pt-BR') return raw;
  const nav = navigator.language?.toLowerCase();
  if (nav.startsWith('pt')) return 'pt-BR';
  return 'en-US';
}

interface I18nContextValue {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  t: (path: MessagePath, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratar idioma do localStorage (somente browser) após o mount
    setLocaleState(readStoredLocale());
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (path: MessagePath, vars?: Record<string, string | number>) => {
      const template = getStringAtPath(messagesByLocale[locale], path);
      return interpolate(template, vars);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
