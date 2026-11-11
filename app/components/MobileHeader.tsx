"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import NotificationDrawer from "./NotificationDrawer";

export default function MobileHeader() {
  const pathname = usePathname();
  const { userProfile } = useApp();

  if (pathname === '/login' || pathname === '/register') return null;

  // Usa userProfile.name, si no existe usa 'U' por defecto
  const userName = userProfile?.name || userProfile?.username || "";
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="md:hidden flex items-center justify-between px-5 h-16 bg-background/70 backdrop-blur-2xl border-b border-white/10 dark:border-white/10 shrink-0 z-40">
      {/* Avatar (Left) */}
      <Link href="/settings" className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 flex items-center justify-center overflow-hidden border border-blue-500/30 hover:scale-105 transition-transform active:scale-95 shadow-sm">
        <span className="text-blue-400 font-black text-xs">{userInitial}</span>
      </Link>

      {/* Logo (Center) */}
      <Link href="/" className="hover:opacity-80 transition-opacity active:scale-95 flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
          <span className="text-white font-black text-xs">K</span>
        </div>
        <h1 className="text-lg font-black text-foreground tracking-tighter">
          Kallp<span className="text-blue-500">:</span>
        </h1>
      </Link>

      {/* Notification Drawer (Right) */}
      <NotificationDrawer />
    </header>
  );
}
