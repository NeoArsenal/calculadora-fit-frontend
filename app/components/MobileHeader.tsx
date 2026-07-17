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
    <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white dark:bg-[#0a0a0b] border-b border-gray-200 dark:border-white/10 shrink-0 z-40">
      {/* Avatar (Left) */}
      <Link href="/settings" className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center overflow-hidden border border-blue-200 dark:border-blue-500/30 hover:scale-105 transition-transform active:scale-95">
        <span className="text-blue-600 dark:text-blue-400 font-black text-xs">{userInitial}</span>
      </Link>

      {/* Logo (Center) */}
      <Link href="/" className="hover:opacity-80 transition-opacity active:scale-95">
        <h1 className="text-xl font-black text-blue-600 tracking-tighter">
          Kallp
        </h1>
      </Link>

      {/* Notification Drawer (Right) */}
      <NotificationDrawer />
    </header>
  );
}
