"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Apple, Activity, LogOut, Settings2 } from "lucide-react";

// ⚡️ Importamos los componentes atómicos de Shadcn UI
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/app/context/AppContext";
import NotificationDrawer from "./NotificationDrawer";
import { Bell } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname(); // Para saber en qué página estamos y pintar el botón activo
  const { analytics, logout } = useApp();
  
  if (pathname === '/login' || pathname === '/register') return null;

  const xp = analytics?.xp || 0;
  const level = analytics?.level || 1;
  const nextLevelXp = analytics?.nextLevelXp || 100;
  const rankName = analytics?.rankName || 'Rookie';
  const progressPercentage = Math.min((xp / nextLevelXp) * 100, 100);

  // Arreglo de rutas para mantener el código limpio (Clean Code)
  const routes = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Training", href: "/training", icon: Dumbbell },
    { name: "Nutrition", href: "/nutrition", icon: Apple },
    { name: "Analytics", href: "/analytics", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings2 },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col bg-background/40 backdrop-blur-xl border-r border-border h-screen z-50">
      
      {/* 🔴 HEADER DEL SIDEBAR */}
      <div className="h-24 flex items-center px-8">
        <Link href="/">
          <h1 className="text-3xl font-black text-foreground tracking-tighter hover:opacity-80 transition-opacity">
            Kallp<span className="text-blue-500">:</span>
          </h1>
        </Link>
      </div>

      <Separator className="bg-border/50" />

      {/* 🔴 NAVEGACIÓN PRINCIPAL CON BOTONES SHADCN */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          const Icon = route.icon;

          return (
            <Link key={route.href} href={route.href} className="block">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-4 h-12 text-md transition-all ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 hover:text-blue-400 border border-blue-500/20" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                {route.name}
              </Button>
            </Link>
          );
        })}

        <NotificationDrawer 
          customTrigger={(unreadCount) => (
            <Button
              variant="ghost"
              className="w-full justify-start gap-4 h-12 text-md transition-all text-muted-foreground hover:text-foreground"
            >
              <div className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </div>
              Inteligencia
            </Button>
          )}
        />
      </nav>

      <Separator className="bg-border/50" />

      {/* 🔴 GAMIFICATION WIDGET */}
      <div className="px-6 py-6">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Level {level}</p>
              <p className="text-sm font-black italic text-gray-900 dark:text-white tracking-tight">{rankName}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
              <span className="text-blue-600 dark:text-blue-400 font-black text-xs">{level}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>XP</span>
              <span>{xp} / {nextLevelXp}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 FOOTER DEL SIDEBAR */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          onClick={logout}
          className="w-full justify-start gap-4 h-12 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </aside>
  );
}