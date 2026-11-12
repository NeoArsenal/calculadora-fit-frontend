"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Camera,
  X,
  Loader2,
  ImagePlus,
  Sparkles,
  Search,
  Utensils,
  SlidersHorizontal,
  ChevronRight,
  SwitchCamera,
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
  "Sin cremas",
  "Parte pecho",
  "Con cremas",
  "Porción grande",
];

export default function MealScanner({ onScanResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"camera" | "peruvian" | "text">("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Contexto opcional compacto
  const [contextHint, setContextHint] = useState("");
  const [showCustomNote, setShowCustomNote] = useState(false);

  // Buscador de platos peruanos y modo texto IA
  const [searchQuery, setSearchQuery] = useState("");
  const [textDescription, setTextDescription] = useState("");

  const stopCamera = useCallback(() => {
    setStream((prevStream) => {
      if (prevStream) {
        prevStream.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setPreviewUrl(null);
    setCameraError(false);
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
      setCameraError(true);
      setIsCameraActive(false);
    }
  }, []);

  // Auto-iniciar cámara al abrir en modo "camera"
  useEffect(() => {
    if (mode === "camera" && !previewUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, startCamera, stopCamera, previewUrl]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

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

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;

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
      setPreviewUrl(null);
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
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col sm:items-center sm:justify-center sm:p-4 animate-in fade-in duration-200">
      {/* CONTENEDOR MÓVIL FULL-SCREEN / DESKTOP CARD */}
      <div className="w-full h-[100dvh] sm:h-[680px] sm:max-h-[90vh] sm:max-w-md bg-[#09090c] sm:rounded-[2.5rem] sm:border sm:border-white/10 flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* 1. CABECERA COMPACTA ESTILO APP NATIVA */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0 z-20 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-white font-black italic uppercase tracking-tight text-sm leading-none">
                  Kallp Vision
                </h2>
                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white/10 text-white/80">
                  🇵🇪 CENAN
                </span>
              </div>
              <p className="text-[9px] text-white/45 font-semibold mt-0.5">
                Escáner Nutricional Inteligente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. PESTAÑAS SEGMENTADAS ULTRA LIMPIAS */}
        <div className="px-4 pb-3 shrink-0 z-20">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/[0.06] border border-white/10">
            <button
              type="button"
              onClick={() => setMode("camera")}
              className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                mode === "camera"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <Camera size={13} /> Cámara
            </button>
            <button
              type="button"
              onClick={() => setMode("peruvian")}
              className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                mode === "peruvian"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <Utensils size={13} /> Platos Perú
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                mode === "text"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <Sparkles size={13} /> Texto IA
            </button>
          </div>
        </div>

        {/* 3. CONTENIDO PRINCIPAL SEGÚN MODO */}
        {mode === "camera" && (
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* VISOR DE CÁMARA CON MARCO DE ESCANEO */}
            <div className="flex-1 mx-4 rounded-[2rem] overflow-hidden relative bg-[#111116] border border-white/10 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 text-center space-y-4 max-w-[260px]">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Camera size={30} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-white">
                      {cameraError ? "Cámara no disponible" : "Iniciando cámara..."}
                    </p>
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      Toma una foto de tu plato o elige una imagen desde tu galería.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
                    >
                      <ImagePlus size={15} /> Elegir Foto de Galería
                    </button>
                    {cameraError && (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <SwitchCamera size={13} /> Reintentar Cámara
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Retícula visual estilo Cal AI cuando la cámara está activa */}
              {(isCameraActive || previewUrl) && (
                <div className="absolute inset-6 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-7 h-7 border-t-[3px] border-l-[3px] border-white/70 rounded-tl-xl" />
                    <div className="w-7 h-7 border-t-[3px] border-r-[3px] border-white/70 rounded-tr-xl" />
                  </div>
                  {!isProcessing && (
                    <div className="self-center px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">
                        Centra el plato en el recuadro
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <div className="w-7 h-7 border-b-[3px] border-l-[3px] border-white/70 rounded-bl-xl" />
                    <div className="w-7 h-7 border-b-[3px] border-r-[3px] border-white/70 rounded-br-xl" />
                  </div>
                </div>
              )}

              {/* Overlay de carga al procesar */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30 p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-400" size={28} />
                  </div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    Identificando ingredientes y gramos...
                  </p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                    Tablas Peruanas CENAN • Visión HD
                  </p>
                </div>
              )}
            </div>

            {/* BARRA DESLIZABLE DE CHIPS DE CONTEXTO + CONTROLES DE CÁMARA */}
            <div className="px-4 pt-3 pb-5 space-y-3 shrink-0">
              {/* Tira horizontal de una sola línea (no ocupa espacio vertical) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {QUICK_CONTEXT_CHIPS.map((chip) => {
                  const active = contextHint.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all shrink-0 border ${
                        active
                          ? "bg-blue-600 border-blue-400 text-white shadow-sm shadow-blue-600/30"
                          : "bg-white/[0.06] border-white/10 text-white/65 hover:text-white"
                      }`}
                    >
                      {active ? "✓ " : ""}
                      {chip}
                    </button>
                  );
                })}
              </div>

              {/* Input desplegable solo si el usuario toca el botón de nota */}
              {showCustomNote && (
                <input
                  type="text"
                  value={contextHint}
                  onChange={(e) => setContextHint(e.target.value)}
                  placeholder="Nota opcional: ej. Lomo saltado casero con poca papa..."
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-blue-500 animate-in fade-in duration-150"
                />
              )}

              {/* DOCK INFERIOR DE 3 BOTONES ESTILO CÁMARA NATIVA (Galería | Obturador | Nota) */}
              <div className="flex items-center justify-around pt-1">
                {/* Botón Galería */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.08] group-hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all active:scale-95">
                    <ImagePlus size={20} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/55">
                    Galería
                  </span>
                </button>

                {/* Botón Obturador Central */}
                <button
                  type="button"
                  onClick={isCameraActive ? captureAndScan : () => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="relative w-[72px] h-[72px] rounded-full p-1.5 border-[3px] border-white/80 flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40"
                  title="Escanear plato"
                >
                  <div className="w-full h-full rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-colors">
                    <Camera size={24} className="text-white" />
                  </div>
                </button>

                {/* Botón Nota / Detalle */}
                <button
                  type="button"
                  onClick={() => setShowCustomNote((v) => !v)}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-95 ${
                      showCustomNote || contextHint
                        ? "bg-blue-600/25 border-blue-500 text-blue-400"
                        : "bg-white/[0.08] border-white/10 text-white"
                    }`}
                  >
                    <SlidersHorizontal size={19} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/55">
                    Detalle
                  </span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </div>
        )}

        {/* MODO 2: CATÁLOGO PERUANO CALIBRADO */}
        {mode === "peruvian" && (
          <div className="flex-1 flex flex-col min-h-0 px-4 pb-4 space-y-3">
            <div className="relative shrink-0">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar: Lomo saltado, Pollo a la brasa, Ceviche..."
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredPresets.map((dish: MealData) => (
                <button
                  key={dish.name}
                  type="button"
                  onClick={() => onScanResult(dish)}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/[0.04] hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-white group-hover:text-blue-400 transition-colors truncate">
                        {dish.name}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/65 shrink-0">
                        {dish.totalGrams}g
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/55 font-bold">
                      <span className="text-orange-400 font-black">
                        {dish.calories} kcal
                      </span>
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

        {/* MODO 3: DESCRIBIR PLATO CON IA */}
        {mode === "text" && (
          <div className="flex-1 flex flex-col justify-between px-4 pb-5 pt-1">
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <h3 className="text-xs font-black uppercase text-blue-400">
                  Calculador por Descripción Peruana
                </h3>
                <p className="text-[11px] text-white/65 leading-relaxed">
                  Escribe los alimentos o el plato tal como lo comiste y la IA desglosará cada ingrediente con sus gramos.
                </p>
              </div>

              <textarea
                rows={5}
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="Ej: Un plato de arroz con pollo con una papa a la huancaína pequeña, o 2 panes con palta y 3 huevos revueltos..."
                className="w-full rounded-2xl bg-white/[0.05] border border-white/10 p-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleTextAnalyze}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Calculando macros...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Desglosar Plato con IA
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
