import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./components/Sidebar"; // ⚡️ IMPORTAMOS TU NUEVO SIDEBAR
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
          {/* ⚡️ ESTRUCTURA MODIFICADA: flex (lado a lado) en lugar de flex-col (arriba a abajo) */}
          <div className="relative flex h-screen w-full">
            
            {/* MENÚ LATERAL FIJO A LA IZQUIERDA */}
            <Sidebar />

            {/* CONTENIDO PRINCIPAL SCROLLEABLE A LA DERECHA */}
            <main className="flex-1 overflow-y-auto bg-background/50">
              {/* Un contenedor para darle márgenes y que no se pegue a los bordes */}
              <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}