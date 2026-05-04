'use client';

import { useCallback, useState } from 'react';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useColorMode } from '@/core/providers/ColorModeProvider';
import type { AppLocale } from '@/shared/i18n';
import { useI18n } from '@/shared/i18n';

export function ThemeLocaleToolbar({ dense }: { dense?: boolean }) {
  const { mode, toggleColorMode } = useColorMode();
  const { locale, setLocale, t } = useI18n();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const pickLocale = useCallback(
    (next: AppLocale) => {
      setLocale(next);
      handleClose();
    },
    [setLocale, handleClose],
  );

  const spacing = dense ? 0.5 : 1;

  return (
    <Stack direction="row" spacing={spacing} sx={{ alignItems: 'center' }}>
      <Tooltip
        title={
          mode === 'light' ? t('settings.themeDark') : t('settings.themeLight')
        }
      >
        <IconButton
          onClick={toggleColorMode}
          color="inherit"
          aria-label={t('settings.toggleTheme')}
          size={dense ? 'small' : 'medium'}
        >
          {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
      </Tooltip>

      <Tooltip title={t('settings.language')}>
        <IconButton
          onClick={handleOpen}
          color="inherit"
          aria-label={t('settings.language')}
          size={dense ? 'small' : 'medium'}
        >
          <LanguageIcon fontSize={dense ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          selected={locale === 'pt-BR'}
          onClick={() => pickLocale('pt-BR')}
        >
          <Typography variant="body2">{t('settings.localePt')}</Typography>
        </MenuItem>
        <MenuItem
          selected={locale === 'en-US'}
          onClick={() => pickLocale('en-US')}
        >
          <Typography variant="body2">{t('settings.localeEn')}</Typography>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
