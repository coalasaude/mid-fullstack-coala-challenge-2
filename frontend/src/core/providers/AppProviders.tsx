'use client';

import { useMemo } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '@/core/auth';
import { ColorModeProvider, useColorMode } from '@/core/providers/ColorModeProvider';
import { I18nProvider } from '@/shared/i18n';
import { createAppTheme } from '@/shared/theme/create-app-theme';

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { mode } = useColorMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <I18nProvider>
        <AuthProvider>{children}</AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ColorModeProvider>
        <ThemeBridge>{children}</ThemeBridge>
      </ColorModeProvider>
    </AppRouterCacheProvider>
  );
}
