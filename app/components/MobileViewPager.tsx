"use client";

import { useRef, useEffect, useState } from "react";
import { LayoutDashboard, Dumbbell, Apple, Activity } from "lucide-react";
import DashboardPage from "../page";
import TrainingPage from "../(routes)/training/page";
import NutritionPage from "../(routes)/nutrition/page";
import AnalyticsPage from "../(routes)/analytics/page";
import { usePathname } from "next/navigation";

const ROUTES = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, component: DashboardPage },
  { name: "Training", href: "/training", icon: Dumbbell, component: TrainingPage },
  { name: "Nutrition", href: "/nutrition", icon: Apple, component: NutritionPage },
  { name: "Analytics", href: "/analytics", icon: Activity, component: AnalyticsPage },
];

export default function MobileViewPager() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pathname = usePathname();

  // En el primer render, si la URL real es diferente (ej. si el usuario entró directo a /training)
  // movemos el scroll al panel correcto
  useEffect(() => {
    const initialIndex = ROUTES.findIndex(r => r.href === pathname);
    if (initialIndex > -1 && scrollContainerRef.current) {
      scrollToIndex(initialIndex);
    }
  }, []);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const panelWidth = container.clientWidth;
    container.scrollTo({
      left: index * panelWidth,
      behavior: "smooth"
    });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const panelWidth = container.clientWidth;
    const newIndex = Math.round(container.scrollLeft / panelWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < ROUTES.length) {
      setActiveIndex(newIndex);
      // Opcional: Podríamos actualizar la URL shallowly aquí si quisieramos
      // window.history.replaceState(null, '', ROUTES[newIndex].href);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-background/50">
      {/* Contenedor deslizante */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {ROUTES.map((route, i) => {
          const PageComponent = route.component;
          return (
            <div key={route.href} className="min-w-[100vw] w-screen h-full snap-start overflow-y-auto no-scrollbar">
              <div className="p-4 pb-24 min-h-full">
                <PageComponent />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reemplazamos BottomNav aquí adentro para controlar los clics */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-50 px-6 pb-2">
        <div className="flex justify-between items-center h-full max-w-md mx-auto">
          {ROUTES.map((route, index) => {
            const isActive = index === activeIndex;
            const Icon = route.icon;

            return (
              <button 
                key={route.href} 
                onClick={() => scrollToIndex(index)}
                className="flex flex-col items-center justify-center w-16 h-full gap-1"
              >
                <Icon 
                  size={24} 
                  className={`transition-colors duration-200 ${
                    isActive ? "text-blue-600 dark:text-blue-500" : "text-gray-400 dark:text-muted-foreground"
                  }`}
                />
                <span 
                  className={`text-[10px] font-bold transition-colors duration-200 ${
                    isActive ? "text-blue-600 dark:text-blue-500" : "text-gray-400 dark:text-muted-foreground"
                  }`}
                >
                  {route.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
