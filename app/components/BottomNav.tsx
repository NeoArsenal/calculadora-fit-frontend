"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Apple, Activity } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/register') return null;

  const routes = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Training", href: "/training", icon: Dumbbell },
    { name: "Nutrition", href: "/nutrition", icon: Apple },
    { name: "Analytics", href: "/analytics", icon: Activity },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-50 px-6 pb-2">
      <div className="flex justify-between items-center h-full max-w-md mx-auto">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          const Icon = route.icon;

          return (
            <Link key={route.href} href={route.href} className="flex flex-col items-center justify-center w-16 h-full gap-1">
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
