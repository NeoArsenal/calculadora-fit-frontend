"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Camera,
  X,
  Zap,
  Loader2,
  ImagePlus,
  Sparkles,
  Search,
  Utensils,
  MessageSquarePlus,
  ChevronRight,
} from "lucide-react";
import {
  scanMeal,
  analyzeMealText,
  PERUVIAN_DISH_PRESETS,
  MealData,
} from "../services/nutritionService";
import { toast } from "sonner";

interface Props {
  onScanResult: (data: any) => void;
  onClose: () => void;
}

const QUICK_CONTEXT_CHIPS = [
  "Casero (poco aceite)",
  "De restaurante",
  "Sin cremas / salsas",
  "Parte pecho (magro)",
  "Con cremas (huancaína/mayonesa)",
  "Porción grande",
];

export default function MealScanner({ onScanResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"camera" | "peruvian" | "text">("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Contexto opcional para mejorar la precisión de la IA en fotos
  const [contextHint, setContextHint] = useState("");

  // Buscador de platos peruanos y modo texto IA
  const [searchQuery, setSearchQuery] = useState("");
  const [textDescription, setTextDescription] = useState("");

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const startCamera = async () => {
    setPreviewUrl(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      toast.error("No se pudo acceder a la cámara. Puedes subir una foto de tu galería.");
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const toggleChip = (chip: string) => {
    setContextHint((prev) => {
      if (prev.includes(chip)) {
        return prev
          .replace(chip, "")
          .replace(/,\s*,/g, ",")
          .replace(/^,\s*|\s*,\s*$/g, "")
          .trim();
      }
      return prev ? `${prev}, ${chip}` : chip;
    });
  };

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setIsProcessing(false);
          return;
        }

        try {
          const result = await scanMeal(blob, contextHint);
          stopCamera();
          onScanResult(result);
        } catch (err: any) {
          console.error("Error en el escaneo:", err);
          toast.error(`Kallp IA: ${err.message || "Error al analizar la imagen"}`);
        } finally {
          setIsProcessing(false);
        }
      },
      "image/jpeg",
      0.9
    );
  }, [onScanResult, contextHint, stopCamera]);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    stopCamera();
    setIsProcessing(true);

    try {
      const result = await scanMeal(file, contextHint);
      onScanResult(result);
    } catch (err: any) {
      console.error("Error al analizar foto de galería:", err);
      toast.error(`Kallp IA: ${err.message || "No se pudo analizar la foto"}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleTextAnalyze = async () => {
    if (!textDescription.trim()) {
      toast.error("Describe tu plato primero (ej. Lomo saltado casero con poca papa)");
      return;
    }
    setIsProcessing(true);
    try {
      const result = await analyzeMealText(textDescription.trim());
      stopCamera();
      onScanResult(result);
    } catch (err: any) {
      console.error("Error en análisis por texto:", err);
      toast.error(`Kallp IA: ${err.message || "Error al analizar tu descripción"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPresets = PERUVIAN_DISH_PRESETS.filter(
    (dish) =>
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col gap-4 my-auto">
        {/* TOP HEADER & SEGMENTED TABS */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-black italic uppercase tracking-tighter text-2xl">
                Kallp Vision Pro_
              </h2>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                🇵🇪 CENAN + IA
              </span>
            </div>
            <p className="text-blue-400 font-bold uppercase text-[9px] tracking-[0.25em] mt-0.5">
              Escáner Volumétrico de Alta Precisión
            </p>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2.5 bg-white/10 text-white/70 hover:text-white rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3-MODE SWITCHER */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              mode === "camera"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Camera size={13} /> Escáner Foto
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode("peruvian");
            }}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              mode === "peruvian"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Utensils size={13} /> Platos Perú
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode("text");
            }}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              mode === "text"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Sparkles size={13} /> Describir IA
          </button>
        </div>

        {/* MODO 1: CÁMARA Y GALERÍA + CONTEXTO IA */}
        {mode === "camera" && (
          <div className="space-y-3.5">
            {/* Contexto previo para afinar salsas/aceite/porción */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1">
                  <MessageSquarePlus size={11} /> Precisión Extra (Opcional)
                </span>
                {contextHint && (
                  <button
                    type="button"
                    onClick={() => setContextHint("")}
                    className="text-[9px] text-white/40 hover:text-white uppercase font-bold"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_CONTEXT_CHIPS.map((chip) => {
                  const active = contextHint.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all border ${
                        active
                          ? "bg-blue-500/20 border-blue-500 text-blue-300"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      {active ? "✓ " : "+ "}
                      {chip}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={contextHint}
                onChange={(e) => setContextHint(e.target.value)}
                placeholder="Ej: Lomo saltado casero con poca papa, sin cremas..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Visor de Cámara / Imagen */}
            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 bg-[#0a0a0c] shadow-[0_0_50px_rgba(37,99,235,0.12)]">
              {!isCameraActive && !previewUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <div className="p-6 bg-blue-600/10 rounded-full border border-blue-500/20">
                    <Camera size={42} className="text-blue-400" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <p className="text-xs font-black uppercase tracking-wider text-white">
                      Escanea tu plato o sube una foto
                    </p>
                    <p className="text-[11px] text-white/50">
                      Detecta ingredientes peruanos, doble carbohidrato, aderezos y gramos por porción.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-600/25"
                    >
                      <Camera size={14} /> Abrir Cámara
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/10 hover:bg-white/15 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 border border-white/10"
                    >
                      <ImagePlus size={14} /> Subir de Galería
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Vista previa de comida"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 p-6 text-center">
                      <Loader2 className="animate-spin text-blue-500" size={44} />
                      <p className="text-xs font-black text-white uppercase tracking-widest">
                        Desglosando ingredientes y gramos...
                      </p>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                        Calibración CENAN Perú • GPT-4o High-Res
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Botones de Disparo / Galería cuando la cámara está activa */}
            {isCameraActive && (
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border border-white/10"
                >
                  <ImagePlus size={15} /> Galería
                </button>

                <button
                  type="button"
                  onClick={captureAndScan}
                  disabled={isProcessing}
                  className={`px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-wider text-white transition-all ${
                    isProcessing
                      ? "bg-gray-800"
                      : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.45)] active:scale-95"
                  }`}
                >
                  <Zap size={18} fill="currentColor" /> Capturar y Analizar
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </div>
        )}

        {/* MODO 2: CATÁLOGO PERUANO CALIBRADO (1 CLIC) */}
        {mode === "peruvian" && (
          <div className="bg-[#0d0d11] border border-white/10 rounded-[2rem] p-4 space-y-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plato peruano (Lomo saltado, Pollo a la brasa, Ceviche...)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredPresets.map((dish: MealData) => (
                <button
                  key={dish.name}
                  type="button"
                  onClick={() => onScanResult(dish)}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-white group-hover:text-blue-400 transition-colors truncate">
                        {dish.name}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/60 shrink-0">
                        {dish.totalGrams}g
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/50 font-bold">
                      <span className="text-orange-400 font-black">{dish.calories} kcal</span>
                      <span>•</span>
                      <span className="text-blue-400">P: {dish.protein}g</span>
                      <span className="text-pink-400">C: {dish.carbs}g</span>
                      <span className="text-purple-400">G: {dish.fat}g</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-white/30 group-hover:text-blue-400 shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODO 3: DESCRIBIR PLATO CON IA (SIN FOTO) */}
        {mode === "text" && (
          <div className="bg-[#0d0d11] border border-white/10 rounded-[2rem] p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-white">
                Describe lo que comiste
              </h3>
              <p className="text-xs text-white/50">
                La IA desglosará cada ingrediente peruano o casero con sus gramos y macros exactos.
              </p>
            </div>

            <textarea
              rows={4}
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="Ej: Un plato de tallarines verdes con media pechuga de pollo a la plancha y una papa a la huancaína pequeña..."
              className="w-full rounded-2xl bg-black/60 border border-white/10 p-3.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 resize-none"
            />

            <button
              type="button"
              onClick={handleTextAnalyze}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Calculando desglose con IA...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Calcular Macros e Ingredientes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
