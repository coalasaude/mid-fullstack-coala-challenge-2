'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PaletteMode } from '@mui/material/styles';
import { COLOR_MODE_STORAGE_KEY } from '@/shared/i18n/storage-keys';

interface ColorModeContextValue {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(
  undefined,
);

function readStoredMode(): PaletteMode {
  if (typeof window === 'undefined') return 'light';
  const raw = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<PaletteMode>('light');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratar tema do localStorage / prefers-color-scheme após o mount
    setModeState(readStoredMode());
  }, []);

  const setMode = useCallback((next: PaletteMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    }
  }, []);

  const toggleColorMode = useCallback(() => {
    setModeState((prev) => {
      const next: PaletteMode = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  const value = useMemo<ColorModeContextValue>(
    () => ({ mode, setMode, toggleColorMode }),
    [mode, setMode, toggleColorMode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used within ColorModeProvider');
  return ctx;
}
