"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Apple, Activity, LogOut } from "lucide-react";

// ⚡️ Importamos los componentes atómicos de Shadcn UI
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
  const pathname = usePathname(); // Para saber en qué página estamos y pintar el botón activo

  // Arreglo de rutas para mantener el código limpio (Clean Code)
  const routes = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Training", href: "/training", icon: Dumbbell },
    { name: "Nutrition", href: "/nutrition", icon: Apple },
    { name: "Analytics", href: "/analytics", icon: Activity },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col bg-background/40 backdrop-blur-xl border-r border-border h-screen z-50">
      
      {/* 🔴 HEADER DEL SIDEBAR */}
      <div className="h-24 flex items-center px-8">
        <h1 className="text-3xl font-black text-foreground tracking-tighter">
          Kallp<span className="text-blue-500">:</span>
        </h1>
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
      </nav>

      <Separator className="bg-border/50" />

      {/* 🔴 FOOTER DEL SIDEBAR */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-4 h-12 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </aside>
  );
}