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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-2xl border-t border-white/10 dark:border-white/10 z-50 px-6 pb-2 shadow-2xl">
      <div className="flex justify-between items-center h-full max-w-md mx-auto">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          const Icon = route.icon;

          return (
            <Link key={route.href} href={route.href} className="flex flex-col items-center justify-center w-16 h-full gap-1 active:scale-95 transition-transform">
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? "bg-blue-500/15 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]" : "text-muted-foreground"
              }`}>
                <Icon size={22} className={isActive ? "text-blue-400" : "text-muted-foreground"} />
              </div>
              <span 
                className={`text-[10px] font-semibold tracking-tight transition-colors duration-200 ${
                  isActive ? "text-blue-400 font-bold" : "text-muted-foreground"
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
