"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// Usamos type import para que TypeScript no se queje
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}