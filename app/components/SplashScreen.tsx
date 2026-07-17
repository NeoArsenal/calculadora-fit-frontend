"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Esconder el splash screen después de 1.8 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712]"
        >
          {/* Círculo de resplandor de fondo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.4, scale: 1.5 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute w-48 h-48 bg-blue-500 rounded-full blur-[100px] pointer-events-none"
          />

          {/* Logo animado */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.3)]"
          >
            <img 
              src="/icon-512x512.png" 
              alt="Kallp Logo" 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Texto de carga opcional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="relative z-10 mt-8 text-blue-500/80 font-black tracking-[0.4em] text-xs uppercase"
          >
            Iniciando...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
