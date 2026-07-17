import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "@/components/ui/sonner";
import MainLayoutWrapper from "./components/MainLayoutWrapper";
import { ThemeProvider } from "./components/ThemeProvider"; // ⚡️ IMPORTAMOS EL PROVIDER DEL TEMA

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
});

export const metadata: Metadata = {
  title: "Kallp: | Dashboard",
  description: "Seguimiento de progreso físico y nutrición",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kallp:",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
};

import { AppProvider } from "@/app/context/AppContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ⚡️ QUITAMOS className="dark" de aquí para que next-themes tome el control dinámicamente
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-hidden", // ⚡️ Evita doble scroll
          inter.variable
        )}
      >
        {/* Barra de carga superior */}
        <NextTopLoader 
          color="#3b82f6" 
          height={3}
          showSpinner={false} 
        />
        
        {/* IMPORTANTE: El Toaster debe estar aquí para que se vea en toda la app */}
        <Toaster position="top-right" richColors closeButton />

        {/* ⚡️ APLICAMOS EL THEME PROVIDER A TODA LA APLICACIÓN */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Puedes cambiarlo a "light" si quieres que inicie claro
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}