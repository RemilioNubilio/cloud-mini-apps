"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
      {children}
    </NextThemeProvider>
  );
}

