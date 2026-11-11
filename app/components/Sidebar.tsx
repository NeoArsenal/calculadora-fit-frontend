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
    <aside className="w-64 hidden md:flex flex-col bg-background/50 backdrop-blur-2xl border-r border-white/10 dark:border-white/10 h-screen z-50 shadow-2xl">
      
      {/* 🔴 HEADER DEL SIDEBAR */}
      <div className="h-24 flex items-center px-8 border-b border-white/5">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-lg">K</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tighter group-hover:opacity-90 transition-opacity">
            Kallp<span className="text-blue-500 group-hover:text-cyan-400 transition-colors">:</span>
          </h1>
        </Link>
      </div>

      {/* 🔴 NAVEGACIÓN PRINCIPAL CON BOTONES SHADCN */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          const Icon = route.icon;

          return (
            <Link key={route.href} href={route.href} className="block">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-4 h-12 text-md transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 font-semibold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] translate-x-1" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:translate-x-0.5"
                }`}
              >
                <Icon size={20} className={isActive ? "text-blue-400" : "text-muted-foreground"} />
                {route.name}
              </Button>
            </Link>
          );
        })}

        <NotificationDrawer 
          customTrigger={(unreadCount) => (
            <Button
              variant="ghost"
              className="w-full justify-start gap-4 h-12 text-md transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-white/5 hover:translate-x-0.5"
            >
              <div className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                )}
              </div>
              Inteligencia
            </Button>
          )}
        />
      </nav>

      {/* 🔴 GAMIFICATION WIDGET */}
      <div className="px-4 py-4">
        <div className="glass-card rounded-2xl p-4 space-y-3.5 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Level {level}</p>
              <p className="text-sm font-black italic text-foreground tracking-tight">{rankName}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-inner">
              <span className="text-blue-400 font-black text-xs">{level}</span>
            </div>
          </div>

          <div className="space-y-1.5 relative z-10">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>XP</span>
              <span className="text-foreground/80">{xp} / {nextLevelXp}</span>
            </div>
            <div className="h-2 w-full bg-black/40 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 FOOTER DEL SIDEBAR */}
      <div className="p-4 border-t border-white/5">
        <Button 
          variant="ghost" 
          onClick={logout}
          className="w-full justify-start gap-4 h-11 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}