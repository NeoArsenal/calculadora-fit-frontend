"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, X, Zap, Loader2, ShieldCheck } from "lucide-react";
import { scanMeal } from "../services/nutritionService";

interface Props {
  onScanResult: (data: any) => void;
  onClose: () => void;
}

export default function MealScanner({ onScanResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. OBTENER EL PERMISO Y EL FLUJO
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      setIsCameraActive(true); // Esto renderiza el elemento <video>
    } catch (err) {
      alert("Error: No se pudo acceder a la cámara.");
      onClose();
    }
  };

  // 2. CONECTAR EL VIDEO (Trick para evitar pantalla negra)
  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  // 3. LIMPIEZA AL CERRAR
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // 4. CAPTURA Y ENVÍO A SPRING BOOT
const captureAndScan = useCallback(async () => {
    // 1. Verificación de referencias
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // 2. Ajustar dimensiones del canvas al video real
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // 3. Dibujar el frame actual del video en el canvas
    ctx.drawImage(video, 0, 0);

    // 4. Convertir a Blob y enviar
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsProcessing(false);
        return;
      }

      try {
        // 🚀 USAMOS EL SERVICIO BLINDADO: 
        // Esto ya maneja el FormData("image") y los errores de tokens
        const result = await scanMeal(blob);

        // Si llega aquí, es porque la IA respondió con éxito (200 OK)
        onScanResult(result);
        
      } catch (err: any) {
        // 🚨 ALERTA DE INGENIERÍA:
        // Si el error es 429 (sin tokens), el mensaje dirá: 
        // "Kallp AI: Límite de escaneos diario alcanzado..."
        console.error("Error en el escaneo:", err);
        alert(`⚠️ KALLP AI: ${err.message}`);
        
      } finally {
        setIsProcessing(false);
      }
    }, "image/jpeg", 0.8);
  }, [onScanResult]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">

      <div className="relative w-full max-w-md aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10 bg-[#0a0a0c] shadow-[0_0_50px_rgba(37,99,235,0.1)]">

        {!isCameraActive ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            <div className="p-10 bg-blue-600/5 rounded-full border border-blue-500/10 animate-pulse">
              <ShieldCheck size={64} className="text-blue-500/20" />
            </div>
            <button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95"
            >
              Initialize Vision_
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full border-[20px] border-black/20" />
              {isProcessing && (
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_#2563eb] animate-scan-line" />
              )}
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 z-30">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-[10px] font-black text-white uppercase tracking-widest text-center px-4">Analyzing Nutrients with Kallp IA...</p>
              </div>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-4 bg-black/40 text-white/50 hover:text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6">
        {isCameraActive && (
          <button
            onClick={captureAndScan}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isProcessing ? 'bg-gray-800' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-90'
              }`}
          >
            <Zap size={32} className="text-white" fill="currentColor" />
          </button>
        )}
        <div className="text-center">
          <h2 className="text-white font-black italic uppercase tracking-tighter text-3xl">Kallp AI Vision_</h2>
          <p className="text-blue-500 font-bold uppercase text-[9px] tracking-[0.5em] mt-1 italic">Artificial Intelligence for Elite Athletes</p>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}