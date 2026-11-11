"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import BottomNav from "./BottomNav";
import MobileViewPager from "./MobileViewPager";

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Definimos qué rutas están controladas por el ViewPager
  const isViewPagerRoute = ['/', '/training', '/nutrition', '/analytics'].includes(pathname);

  return (
    <div className="relative flex h-screen w-full bg-background overflow-hidden">
      {/* Luces ambientales cósmicas para efecto Deep Space & Glassmorphism */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />

      {/* MENÚ LATERAL FIJO A LA IZQUIERDA (SOLO DESKTOP) */}
      <Sidebar />

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen w-full relative z-10">
        {/* CABECERA MÓVIL (SOLO MOBILE) */}
        <MobileHeader />

        {/* CONTENIDO PRINCIPAL SCROLLEABLE (DESKTOP / PANTALLAS GRANDES) */}
        <main className="hidden md:flex flex-1 overflow-y-auto bg-background/50 pb-24 md:pb-0 scroll-smooth">
          <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto min-h-full w-full">
            {children}
          </div>
        </main>

        {/* CONTENIDO MÓVIL (VIEWPAGER O CHILDREN) */}
        <div className="md:hidden flex-1 w-full h-full overflow-hidden">
          {isViewPagerRoute ? (
            <MobileViewPager />
          ) : (
            <div className="w-full h-full overflow-y-auto bg-background/50 scroll-smooth">
               <div className="p-4 pb-28 min-h-full">
                 {children}
               </div>
               {/* Usamos el BottomNav nativo de Next para poder salir de Settings */}
               <BottomNav />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
