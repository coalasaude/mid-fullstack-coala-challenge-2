'use client';

import TextField, { type TextFieldProps } from '@mui/material/TextField';

export type AppTextFieldProps = TextFieldProps;

/** Campo de texto no padrão MUI (`TextField` outlined), com defaults do app. */
export function AppTextField({
  fullWidth = true,
  variant = 'outlined',
  ...props
}: AppTextFieldProps) {
  return <TextField fullWidth={fullWidth} variant={variant} {...props} />;
}
