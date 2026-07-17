"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Orden de las rutas para saber a dónde ir cuando deslizamos
const routesOrder = ["/", "/training", "/nutrition", "/analytics"];

export default function SwipeNavigation({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);

  // Distancia mínima en píxeles para que se considere un deslizamiento válido
  const minSwipeDistance = 75;

  const onTouchStart = (e: React.TouchEvent) => {
    // Si el toque empezó dentro de un elemento marcado para ignorar (como un carrusel), ignoramos.
    if ((e.target as HTMLElement).closest('[data-swipe-ignore="true"]')) {
      return;
    }
    
    setTouchEnd(null); 
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    // Queremos ignorar si el usuario estaba haciendo scroll hacia abajo o arriba (movimiento vertical predominante)
    if (Math.abs(distanceY) > Math.abs(distanceX)) {
      return;
    }

    const currentIndex = routesOrder.indexOf(pathname);
    if (currentIndex === -1) return; // Si estamos en una ruta no principal (ej. login), ignoramos

    if (isLeftSwipe && currentIndex < routesOrder.length - 1) {
      // Deslizó hacia la izquierda -> ir a la ruta de la derecha
      router.push(routesOrder[currentIndex + 1]);
    }

    if (isRightSwipe && currentIndex > 0) {
      // Deslizó hacia la derecha -> ir a la ruta de la izquierda
      router.push(routesOrder[currentIndex - 1]);
    }
  };

  return (
    <div 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEndHandler}
      className="w-full h-full"
    >
      {children}
    </div>
  );
}
