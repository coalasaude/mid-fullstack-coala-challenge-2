"use client";

import {
  alpha,
  createTheme,
  type PaletteMode,
  type Theme,
} from "@mui/material/styles";

function surfaceBackground(theme: Theme, state: "rest" | "hover") {
  const dark = theme.palette.mode === "dark";
  if (state === "hover") {
    return dark
      ? alpha(theme.palette.common.white, 0.09)
      : alpha(theme.palette.common.black, 0.04);
  }
  return dark
    ? alpha(theme.palette.common.white, 0.06)
    : alpha(theme.palette.common.black, 0.02);
}

export function createAppTheme(mode: PaletteMode) {
  return createTheme({
    cssVariables: true,
    palette: {
      mode,
      ...(mode === "light"
        ? {
            primary: { main: "#1976d2" },
            secondary: { main: "#26a69a" },
            background: { default: "#f5f7fa", paper: "#ffffff" },
          }
        : {
            primary: { main: "#90caf9" },
            secondary: { main: "#4db6ac" },
            background: { default: "#0b1220", paper: "#121c30" },
            divider: "rgba(255, 255, 255, 0.09)",
            text: { primary: "#e8edf7", secondary: "#a8b3cc" },
          }),
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily:
        'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme, ownerState }) => {
            const r = `${theme.shape.borderRadius}px`;
            const standardFieldHeight =
              !ownerState.multiline && ownerState.size !== "small"
                ? { minHeight: 56 }
                : {};
            const base = {
              ...standardFieldHeight,
              borderRadius: r,
              backgroundColor: surfaceBackground(theme, "rest"),
              transition: theme.transitions.create(
                ["background-color", "border-color"],
                { duration: theme.transitions.duration.shorter },
              ),
              "&:hover": { backgroundColor: surfaceBackground(theme, "hover") },
              "&.Mui-focused": {
                backgroundColor: surfaceBackground(theme, "rest"),
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.18)
                    : theme.palette.divider,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.text.secondary,
              },
            };
            if (!ownerState.multiline) {
              return base;
            }
            return {
              ...base,
              overflow: "hidden",
              "& .MuiOutlinedInput-notchedOutline": {
                ...base["& .MuiOutlinedInput-notchedOutline"],
                borderRadius: r,
              },
            };
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) =>
            theme.palette.mode === "dark"
              ? {
                  backgroundColor: theme.palette.background.paper,
                  backgroundImage: "none",
                }
              : {},
        },
      },
    },
  });
}
