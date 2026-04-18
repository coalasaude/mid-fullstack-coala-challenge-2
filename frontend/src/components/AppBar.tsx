'use client';

import { useState } from 'react';
import {
  AppBar as MuiAppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useAuth } from '@/lib/auth-context';
import { useThemeMode } from '@/lib/theme-context';
import { roleLabel } from '@/lib/exam-utils';
import { BrandMark } from './BrandMark';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppBar() {
  const { user, logout } = useAuth();
  const { mode, toggle } = useThemeMode();
  const theme = useTheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <MuiAppBar position="sticky">
      <Toolbar sx={{ gap: 2, minHeight: { xs: 60, sm: 68 } }}>
        <BrandMark variant="sm" />
        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={mode === 'dark' ? 'Tema claro' : 'Tema escuro'}>
          <IconButton onClick={toggle} size="small">
            {mode === 'dark' ? (
              <LightModeRoundedIcon fontSize="small" />
            ) : (
              <DarkModeRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {user && (
          <>
            <IconButton
              onClick={(e) => setAnchor(e.currentTarget)}
              sx={{
                p: 0.5,
                borderRadius: 999,
                gap: 1,
                pr: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.8rem',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 700,
                }}
              >
                {initials(user.name)}
              </Avatar>
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  lineHeight: 1.1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                >
                  {roleLabel(user.role)}
                </Typography>
              </Box>
            </IconButton>

            <Menu
              anchorEl={anchor}
              open={!!anchor}
              onClose={() => setAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 220,
                    border: `1px solid ${theme.palette.divider}`,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.25 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setAnchor(null);
                  logout();
                }}
              >
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}
