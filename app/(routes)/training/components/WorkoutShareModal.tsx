"use client";

import React, { useState, useRef } from "react";
import {
    Trophy,
    Zap,
    TrendingUp,
    Check,
    Dumbbell,
    Share2,
    Download,
    Camera,
    Sparkles,
    BarChart3,
    CheckCircle2,
    Image as ImageIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export type WorkoutSummaryExercise = {
    id: number;
    name: string;
    bodyPart?: string;
    gifUrl?: string;
    setsDone: number;
    bestWeight: number;
    bestReps: number;
    volumeKg: number;
    prevBestWeight: number;
    weightDiff: number;
    repDiff: number;
    badgeType: "NEW_PR" | "REP_PR" | "FIRST_TIME" | "SOLID";
};

export type WorkoutSummaryData = {
    routineTitle: string;
    durationFormatted: string;
    totalVolumeKg: number;
    totalSetsDone: number;
    totalRepsDone: number;
    newPRsCount: number;
    xpEarned: number;
    exercises: WorkoutSummaryExercise[];
};

type StorySkin = "cyber" | "photo" | "editorial";

const BODY_PART_ES: Record<string, string> = {
    Chest: "PECHO",
    Back: "ESPALDA",
    Legs: "PIERNAS",
    Shoulders: "HOMBROS",
    Arms: "BRAZOS",
    Core: "CORE",
    Cardio: "CARDIO",
};

export default function WorkoutShareModal({
    summary,
    onClose,
}: {
    summary: WorkoutSummaryData | null;
    onClose: () => void;
}) {
    const [tab, setTab] = useState<"story" | "details">("story");
    const [skin, setSkin] = useState<StorySkin>("cyber");
    const [bgPhotoUrl, setBgPhotoUrl] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    if (!summary) return null;

    const now = new Date();
    const dateStamp = now
        .toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" })
        .toUpperCase()
        .replace(".", "");
    const timeStamp = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

    // Extraer grupos musculares únicos en español
    const workedMuscles = Array.from(
        new Set(
            summary.exercises
                .map((e) => (e.bodyPart ? BODY_PART_ES[e.bodyPart] || e.bodyPart.toUpperCase() : null))
                .filter(Boolean)
        )
    ) as string[];

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setBgPhotoUrl(reader.result as string);
            setSkin("photo");
            toast.success("Foto aplicada a tu Kallp Story 📸");
        };
        reader.readAsDataURL(file);
    };

    // 🎨 GENERADOR DE PÓSTER HD (1080x1920) EN CANVAS NATIVO (Estilo Adidas Running)
    const generateStoryBlob = async (): Promise<Blob | null> => {
        const canvas = document.createElement("canvas");
        const W = 1080;
        const H = 1920;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const isLight = skin === "editorial";

        // 1. FONDO BASE
        if (skin === "photo" && bgPhotoUrl) {
            const img = new Image();
            img.src = bgPhotoUrl;
            await new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            });
            // Dibujar imagen con proporción cover
            const imgRatio = img.width / Math.max(img.height, 1);
            const canvasRatio = W / H;
            let drawW = W;
            let drawH = H;
            let offsetX = 0;
            let offsetY = 0;
            if (imgRatio > canvasRatio) {
                drawW = H * imgRatio;
                offsetX = -(drawW - W) / 2;
            } else {
                drawH = W / Math.max(imgRatio, 0.1);
                offsetY = -(drawH - H) / 2;
            }
            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

            // Overlay cinemático oscuro estilo Adidas Running para legibilidad perfecta
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, "rgba(0, 0, 0, 0.55)");
            grad.addColorStop(0.35, "rgba(0, 0, 0, 0.25)");
            grad.addColorStop(0.65, "rgba(5, 8, 18, 0.78)");
            grad.addColorStop(1, "rgba(3, 5, 12, 0.95)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        } else if (isLight) {
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, "#f8fafc");
            grad.addColorStop(1, "#e2e8f0");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Acento diagonal deportivo
            ctx.fillStyle = "rgba(37, 99, 235, 0.06)";
            ctx.beginPath();
            ctx.moveTo(W, 0);
            ctx.lineTo(W, 900);
            ctx.lineTo(0, 1400);
            ctx.lineTo(0, 500);
            ctx.closePath();
            ctx.fill();
        } else {
            // CYBER DARK
            ctx.fillStyle = "#06070a";
            ctx.fillRect(0, 0, W, H);

            // Glow superior azul cobalto
            const topGlow = ctx.createRadialGradient(W * 0.82, H * 0.15, 20, W * 0.82, H * 0.15, 650);
            topGlow.addColorStop(0, "rgba(37, 99, 235, 0.42)");
            topGlow.addColorStop(1, "rgba(37, 99, 235, 0)");
            ctx.fillStyle = topGlow;
            ctx.fillRect(0, 0, W, H);

            // Glow inferior (rosa/carmesí si hubo PR, índigo si no)
            const bottomGlow = ctx.createRadialGradient(W * 0.2, H * 0.82, 20, W * 0.2, H * 0.82, 650);
            bottomGlow.addColorStop(
                0,
                summary.newPRsCount > 0 ? "rgba(244, 63, 94, 0.28)" : "rgba(79, 70, 229, 0.28)"
            );
            bottomGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = bottomGlow;
            ctx.fillRect(0, 0, W, H);

            // Malla técnica sutil
            ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
            ctx.lineWidth = 2;
            const step = 90;
            for (let x = 0; x < W; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.stroke();
            }
            for (let y = 0; y < H; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(W, y);
                ctx.stroke();
            }
        }

        const primaryText = isLight ? "#0f172a" : "#ffffff";
        const mutedText = isLight ? "#64748b" : "rgba(255, 255, 255, 0.6)";
        const accentColor = "#3b82f6";

        // 2. HEADER DE MARCA (KALLP:)
        const padX = 84;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.roundRect(padX, 100, 74, 74, 22);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 42px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("K", padX + 37, 152);

        ctx.textAlign = "left";
        ctx.fillStyle = primaryText;
        ctx.font = "900 48px system-ui, -apple-system, sans-serif";
        ctx.fillText("Kallp", padX + 96, 153);
        ctx.fillStyle = accentColor;
        ctx.fillText(":", padX + 218, 153);

        // Fecha y Hora a la derecha
        ctx.textAlign = "right";
        ctx.fillStyle = mutedText;
        ctx.font = "800 26px system-ui, -apple-system, sans-serif";
        ctx.fillText(`${dateStamp} • ${timeStamp}`, W - padX, 132);
        ctx.fillStyle = accentColor;
        ctx.font = "900 24px system-ui, -apple-system, sans-serif";
        ctx.fillText(`+${summary.xpEarned} XP EARNED`, W - padX, 168);

        // 3. CHIPS DE MÚSCULOS TRABAJADOS
        ctx.textAlign = "left";
        const musclesLine =
            workedMuscles.length > 0 ? workedMuscles.join("  •  ") : "ENTRENAMIENTO DE FUERZA";
        ctx.fillStyle = accentColor;
        ctx.font = "900 28px system-ui, -apple-system, sans-serif";
        ctx.fillText(musclesLine, padX, 290);

        // 4. TÍTULO GIGANTE DE LA RUTINA (ESTILO ADIDAS RUNNING)
        ctx.fillStyle = primaryText;
        ctx.font = "italic 900 92px system-ui, -apple-system, sans-serif";
        const rawTitle = summary.routineTitle.toUpperCase();
        const displayTitle = rawTitle.length > 16 ? rawTitle.slice(0, 16) + "_" : rawTitle + "_";
        ctx.fillText(displayTitle, padX, 395);

        // Badge de Nuevos PRs si aplica
        if (summary.newPRsCount > 0) {
            ctx.fillStyle = "rgba(245, 158, 11, 0.18)";
            ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(padX, 435, 450, 64, 32);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isLight ? "#d97706" : "#fbbf24";
            ctx.font = "900 28px system-ui, -apple-system, sans-serif";
            ctx.fillText(
                `🏆 ${summary.newPRsCount} ${summary.newPRsCount === 1 ? "NUEVO RÉCORD PERSONAL" : "NUEVOS RÉCORDS PERSONALES"}`,
                padX + 28,
                477
            );
        }

        // 5. BLOQUE CENTRAL DE 3 MACRO-MÉTRICAS (ESTILO TELEMETRÍA ADIDAS)
        const metricsTop = 580;

        // Métrica 1: Carga Total (Gigante)
        ctx.fillStyle = mutedText;
        ctx.font = "800 30px system-ui, -apple-system, sans-serif";
        ctx.fillText("VOLUMEN TOTAL LEVANTADO", padX, metricsTop);

        ctx.fillStyle = primaryText;
        ctx.font = "italic 900 156px system-ui, -apple-system, sans-serif";
        const volStr = summary.totalVolumeKg.toLocaleString("en-US");
        ctx.fillText(volStr, padX, metricsTop + 148);
        const volWidth = ctx.measureText(volStr).width;
        ctx.fillStyle = accentColor;
        ctx.font = "italic 900 56px system-ui, -apple-system, sans-serif";
        ctx.fillText("KG", padX + volWidth + 20, metricsTop + 148);

        // Línea divisoria
        ctx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.12)" : "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(padX, metricsTop + 210);
        ctx.lineTo(W - padX, metricsTop + 210);
        ctx.stroke();

        // Sub-métricas en 2 columnas: TIEMPO ACTIVO y SERIES COMPLETADAS
        const subY = metricsTop + 285;
        ctx.fillStyle = mutedText;
        ctx.font = "800 28px system-ui, -apple-system, sans-serif";
        ctx.fillText("TIEMPO ACTIVO", padX, subY);
        ctx.fillText("SERIES / REPS EFECTIVAS", W / 2 + 20, subY);

        ctx.fillStyle = primaryText;
        ctx.font = "italic 900 90px system-ui, -apple-system, sans-serif";
        ctx.fillText(summary.durationFormatted.replace(" min", ""), padX, subY + 96);

        ctx.fillText(
            `${summary.totalSetsDone}S / ${summary.totalRepsDone}R`,
            W / 2 + 20,
            subY + 96
        );

        // 6. LISTA DE TOP EJERCICIOS DE LA SESIÓN
        const listTop = 1090;
        ctx.fillStyle = mutedText;
        ctx.font = "900 26px system-ui, -apple-system, sans-serif";
        ctx.fillText("DESGLOSE DE EJERCICIOS DESTACADOS", padX, listTop);

        const topExercises = summary.exercises.slice(0, 5);
        topExercises.forEach((ex, idx) => {
            const rowY = listTop + 40 + idx * 118;

            // Caja de fila
            ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.06)";
            ctx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(padX, rowY, W - padX * 2, 98, 24);
            ctx.fill();
            ctx.stroke();

            // Barra lateral de color
            ctx.fillStyle = ex.badgeType === "NEW_PR" ? "#f59e0b" : accentColor;
            ctx.beginPath();
            ctx.roundRect(padX, rowY, 12, 98, [24, 0, 0, 24]);
            ctx.fill();

            // Nombre del ejercicio
            ctx.textAlign = "left";
            ctx.fillStyle = primaryText;
            ctx.font = "900 32px system-ui, -apple-system, sans-serif";
            const exTitle =
                ex.name.length > 26 ? ex.name.toUpperCase().slice(0, 26) + "..." : ex.name.toUpperCase();
            ctx.fillText(exTitle, padX + 38, rowY + 58);

            // Mejor marca a la derecha
            ctx.textAlign = "right";
            ctx.fillStyle = ex.badgeType === "NEW_PR" ? (isLight ? "#d97706" : "#fbbf24") : accentColor;
            ctx.font = "italic 900 34px system-ui, -apple-system, sans-serif";
            const markText =
                ex.badgeType === "NEW_PR"
                    ? `🏆 ${ex.bestWeight} KG × ${ex.bestReps}`
                    : `${ex.bestWeight} KG × ${ex.bestReps}`;
            ctx.fillText(markText, W - padX - 34, rowY + 58);
        });

        // 7. FOOTER DE VERIFICACIÓN KALLP
        ctx.textAlign = "center";
        ctx.fillStyle = mutedText;
        ctx.font = "800 24px system-ui, -apple-system, sans-serif";
        ctx.fillText("KALLP PERFORMANCE ECOSYSTEM  •  #KALLPTRIBE", W / 2, H - 85);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
        });
    };

    const handleDownloadStory = async () => {
        setIsExporting(true);
        try {
            const blob = await generateStoryBlob();
            if (!blob) throw new Error("No se pudo generar la imagen");
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `kallp-story-${now.toISOString().slice(0, 10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("¡Póster HD (1080×1920) descargado! Listo para subir a Instagram 🔥");
        } catch (err) {
            console.error(err);
            toast.error("Error al generar la imagen.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleShareNative = async () => {
        setIsExporting(true);
        try {
            const blob = await generateStoryBlob();
            if (!blob) throw new Error("No se pudo generar la imagen");
            const file = new File([blob], `kallp-story-${now.toISOString().slice(0, 10)}.png`, {
                type: "image/png",
            });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Entrenamiento Kallp: ${summary.routineTitle}`,
                    text: `¡Sesión completada en Kallp! ${summary.totalVolumeKg.toLocaleString("en-US")} kg levantados 💪`,
                    files: [file],
                });
                toast.success("¡Compartido con éxito! 🚀");
            } else {
                // Fallback a descarga directa en PC
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast.success("Póster HD descargado. ¡Súbelo directo a tu Story! 📸");
            }
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                toast.error("No se pudo abrir el menú de compartir.");
            }
        } finally {
            setIsExporting(false);
        }
    };

    const isLight = skin === "editorial";

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-card dark:bg-[#09090b] border border-border dark:border-white/10 rounded-[2.25rem] p-4 sm:p-5 overflow-hidden shadow-2xl text-foreground max-h-[94vh] flex flex-col gap-3.5">
                <DialogTitle className="sr-only">Resumen de Entrenamiento Kallp</DialogTitle>

                {/* BARRA SUPERIOR: SELECTOR STORY CARD vs ANÁLISIS TÉCNICO */}
                <div className="flex items-center justify-between gap-2 shrink-0 pr-6">
                    <div className="inline-flex p-1 rounded-2xl bg-muted dark:bg-white/5 border border-border dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => setTab("story")}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                tab === "story"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Sparkles size={13} /> Story Card
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("details")}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                tab === "details"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <BarChart3 size={13} /> Progreso ({summary.exercises.length})
                        </button>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                        +{summary.xpEarned} XP
                    </span>
                </div>

                {tab === "story" ? (
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                        {/* 🎨 PÓSTER INTERACTIVO ESTILO ADIDAS RUNNING (PROPORCIÓN STORY) */}
                        <div
                            className={`relative w-full max-w-[330px] mx-auto aspect-[9/15.2] rounded-[1.85rem] p-5 flex flex-col justify-between overflow-hidden shadow-2xl border transition-all duration-300 select-none ${
                                isLight
                                    ? "bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900 border-slate-300"
                                    : "bg-[#06070a] text-white border-white/15"
                            }`}
                            style={
                                skin === "photo" && bgPhotoUrl
                                    ? {
                                          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.22) 38%, rgba(4,7,17,0.85) 72%, rgba(2,4,10,0.96) 100%), url(${bgPhotoUrl})`,
                                          backgroundSize: "cover",
                                          backgroundPosition: "center",
                                      }
                                    : undefined
                            }
                        >
                            {/* Efectos de fondo para Cyber Dark */}
                            {skin === "cyber" && (
                                <>
                                    <div className="absolute -top-14 -right-14 w-44 h-44 bg-blue-600/35 rounded-full blur-3xl pointer-events-none" />
                                    <div
                                        className={`absolute -bottom-14 -left-14 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
                                            summary.newPRsCount > 0 ? "bg-rose-500/25" : "bg-indigo-600/25"
                                        }`}
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                                </>
                            )}

                            {/* 1. CABECERA DE MARCA KALLP: */}
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/40">
                                        K
                                    </div>
                                    <span className="font-black text-base tracking-tight">
                                        Kallp<span className="text-blue-500">:</span>
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={`text-[9px] font-extrabold uppercase tracking-widest ${
                                            isLight ? "text-slate-500" : "text-white/60"
                                        }`}
                                    >
                                        {dateStamp} • {timeStamp}
                                    </p>
                                </div>
                            </div>

                            {/* 2. TÍTULO DE RUTINA + MÚSCULOS ACTIVADOS */}
                            <div className="relative z-10 my-auto py-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1 truncate">
                                    {workedMuscles.length > 0
                                        ? workedMuscles.join(" • ")
                                        : "SESIÓN DE FUERZA"}
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none truncate">
                                    {summary.routineTitle}
                                    <span className="text-blue-500">_</span>
                                </h2>

                                {summary.newPRsCount > 0 && (
                                    <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                                        <Trophy size={10} /> {summary.newPRsCount}{" "}
                                        {summary.newPRsCount === 1 ? "Nuevo Récord PR" : "Nuevos Récords PR"}
                                    </div>
                                )}

                                {/* 3. TELEMETRÍA GIGANTE TIPO ADIDAS RUNNING */}
                                <div className="mt-4">
                                    <p
                                        className={`text-[8px] font-black uppercase tracking-[0.2em] ${
                                            isLight ? "text-slate-500" : "text-white/55"
                                        }`}
                                    >
                                        VOLUMEN TOTAL LEVANTADO
                                    </p>
                                    <div className="flex items-baseline gap-1.5 -mt-0.5">
                                        <span className="text-5xl font-black italic tracking-tighter leading-none">
                                            {summary.totalVolumeKg.toLocaleString("en-US")}
                                        </span>
                                        <span className="text-lg font-black italic text-blue-500">KG</span>
                                    </div>
                                </div>

                                <div
                                    className={`grid grid-cols-2 gap-3 mt-3 pt-2.5 border-t ${
                                        isLight ? "border-slate-300" : "border-white/15"
                                    }`}
                                >
                                    <div>
                                        <p
                                            className={`text-[8px] font-black uppercase tracking-widest ${
                                                isLight ? "text-slate-500" : "text-white/55"
                                            }`}
                                        >
                                            TIEMPO ACTIVO
                                        </p>
                                        <p className="text-xl font-black italic tracking-tight leading-tight">
                                            {summary.durationFormatted.replace(" min", "")}
                                        </p>
                                    </div>
                                    <div>
                                        <p
                                            className={`text-[8px] font-black uppercase tracking-widest ${
                                                isLight ? "text-slate-500" : "text-white/55"
                                            }`}
                                        >
                                            SERIES / REPS
                                        </p>
                                        <p className="text-xl font-black italic tracking-tight leading-tight">
                                            {summary.totalSetsDone}S{" "}
                                            <span className="text-blue-500">/ {summary.totalRepsDone}R</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 4. HIGHLIGHTS DE EJERCICIOS */}
                            <div className="relative z-10 space-y-1.5">
                                <p
                                    className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${
                                        isLight ? "text-slate-500" : "text-white/50"
                                    }`}
                                >
                                    TOP LEVANTAMIENTOS DE HOY
                                </p>
                                {summary.exercises.slice(0, 3).map((ex) => (
                                    <div
                                        key={ex.id}
                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] border backdrop-blur-md ${
                                            isLight
                                                ? "bg-white/80 border-slate-200/90 text-slate-900"
                                                : "bg-white/[0.07] border-white/10 text-white"
                                        }`}
                                    >
                                        <span className="font-black uppercase truncate pr-2 max-w-[165px]">
                                            {ex.name}
                                        </span>
                                        <span
                                            className={`font-black italic shrink-0 ${
                                                ex.badgeType === "NEW_PR"
                                                    ? "text-amber-500 dark:text-amber-400"
                                                    : "text-blue-600 dark:text-blue-400"
                                            }`}
                                        >
                                            {ex.badgeType === "NEW_PR" ? "🏆 " : ""}
                                            {ex.bestWeight}kg × {ex.bestReps}
                                        </span>
                                    </div>
                                ))}

                                <p
                                    className={`text-[7px] font-extrabold uppercase tracking-[0.25em] text-center pt-1.5 ${
                                        isLight ? "text-slate-400" : "text-white/40"
                                    }`}
                                >
                                    KALLP PERFORMANCE ECOSYSTEM • #KALLPTRIBE
                                </p>
                            </div>
                        </div>

                        {/* CONTROLES DE PERSONALIZACIÓN (SKINS + SUBIR FOTO GYM) */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setSkin("cyber")}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                    skin === "cyber"
                                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                                        : "bg-muted/60 dark:bg-white/5 text-muted-foreground border-border dark:border-white/10 hover:text-foreground"
                                }`}
                            >
                                ⚡ Cyber Dark
                            </button>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                                    skin === "photo"
                                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                                        : "bg-muted/60 dark:bg-white/5 text-muted-foreground border-border dark:border-white/10 hover:text-foreground"
                                }`}
                            >
                                <Camera size={12} /> {bgPhotoUrl ? "Cambiar Foto" : "Foto Gym"}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => setSkin("editorial")}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                    skin === "editorial"
                                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                                        : "bg-muted/60 dark:bg-white/5 text-muted-foreground border-border dark:border-white/10 hover:text-foreground"
                                }`}
                            >
                                🧊 Editorial
                            </button>
                        </div>
                    </div>
                ) : (
                    /* 📊 PESTAÑA 2: DESGLOSE DETALLADO EJERCICIO POR EJERCICIO */
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar py-1">
                        {summary.exercises.map((ex) => (
                            <div
                                key={ex.id}
                                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40 dark:bg-white/[0.03] border border-border dark:border-white/5"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-11 h-11 rounded-xl bg-white border border-border dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                        {ex.gifUrl ? (
                                            <img
                                                src={ex.gifUrl}
                                                alt={ex.name}
                                                className="w-full h-full object-contain mix-blend-multiply"
                                            />
                                        ) : (
                                            <Dumbbell className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black uppercase text-foreground truncate">
                                            {ex.name}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                                            {ex.setsDone} {ex.setsDone === 1 ? "serie" : "series"} • Mejor:{" "}
                                            <span className="text-foreground font-bold">
                                                {ex.bestWeight} kg × {ex.bestReps}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 text-right">
                                    {ex.badgeType === "NEW_PR" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                                            <Trophy size={11} /> Nuevo PR +{ex.weightDiff}kg
                                        </span>
                                    )}
                                    {ex.badgeType === "REP_PR" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                            <TrendingUp size={11} /> +{ex.repDiff} Reps
                                        </span>
                                    )}
                                    {ex.badgeType === "FIRST_TIME" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                                            <Zap size={11} /> 1ª Marca
                                        </span>
                                    )}
                                    {ex.badgeType === "SOLID" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted dark:bg-white/10 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                            <Check size={11} /> Sólido ({ex.volumeKg}kg)
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* BOTONES DE ACCIÓN INFERIORES: COMPARTIR STORY / DESCARGAR PNG / CONTINUAR */}
                <div className="pt-2 border-t border-border dark:border-white/10 flex flex-col gap-2 shrink-0">
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={handleShareNative}
                            disabled={isExporting}
                            className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-black uppercase tracking-wider text-[11px] shadow-lg shadow-blue-600/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                            <Share2 size={14} /> {isExporting ? "Generando..." : "Compartir Story"}
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadStory}
                            disabled={isExporting}
                            className="py-3 px-4 rounded-xl bg-muted dark:bg-white/10 hover:bg-accent dark:hover:bg-white/15 text-foreground font-black uppercase tracking-wider text-[11px] border border-border dark:border-white/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                            <Download size={14} /> Descargar HD
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-1.5"
                    >
                        <CheckCircle2 size={13} /> Continuar al Hub de Entrenamiento
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
