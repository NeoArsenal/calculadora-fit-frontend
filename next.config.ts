import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

/** * 1. Configuramos el motor de la PWA 
 * dest: 'public' guardará el Service Worker donde el navegador pueda leerlo.
 */
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // En desarrollo no molesta, solo en producción
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** * 2. Tu configuración estándar de Next.js 
 */
const nextConfig: NextConfig = {
  /* Aquí puedes poner tus opciones normales como imágenes o redirecciones */
};

/** * 3. Exportamos la combinación de ambos 
 */
export default withPWA(nextConfig);