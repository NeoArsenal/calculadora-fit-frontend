"use client";

import { useState, useEffect, useMemo } from "react";
import { User, Target, Loader2, Flame, CalendarDays } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useApp } from "@/app/context/AppContext";
import { getExercises } from "@/app/(routes)/training/services/exerciseService";
import type { MuscleActivationMap } from "./BodyScanner3D";

interface BodyCompositionMapProps {
  records: any[];
  onSelectPart: (part: string | null) => void;
  onRefresh?: () => void | Promise<void>;
}

const BodyScanner3D = dynamic(() => import("./BodyScanner3D"), {
  ssr: false,
});

type MuscleKey = keyof MuscleActivationMap;

const MUSCLE_GROUPS: {
  key: MuscleKey;
  coachKey: string;
  label: string;
}[] = [
  { key: "chest", coachKey: "chest", label: "Pecho" },
  { key: "back", coachKey: "espalda", label: "Espalda" },
  { key: "shoulders", coachKey: "hombros", label: "Hombros" },
  { key: "arms", coachKey: "brazos", label: "Brazos" },
  { key: "core", coachKey: "waist", label: "Core" },
  { key: "legs", coachKey: "piernas", label: "Piernas" },
];

// Clasificador híbrido por bodyPart del catálogo + nombre en español/inglés
function classifyExerciseToMuscle(
  log: any,
  exerciseCatalog: any[]
): { primary: MuscleKey | null; secondary?: MuscleKey } {
  const matched = exerciseCatalog.find(
    (e) =>
      (log.exerciseId && Number(e.id) === Number(log.exerciseId)) ||
      (log.exerciseName &&
        e.name?.toLowerCase().trim() === log.exerciseName?.toLowerCase().trim())
  );

  const rawBodyPart = (matched?.bodyPart || "").toLowerCase();
  const rawName = (log.exerciseName || matched?.name || "").toLowerCase();

  if (
    rawBodyPart.includes("chest") ||
    rawBodyPart.includes("pecho") ||
    /banca|pecho|pectoral|apertura|fondos en paralelas|cruces en polea|push-up|flexiones|pullover/.test(
      rawName
    )
  ) {
    return { primary: "chest", secondary: "arms" };
  }

  if (
    rawBodyPart.includes("back") ||
    rawBodyPart.includes("espalda") ||
    /dominada|jal[oó]n|remo|espalda|dorsal|pull-down|pull up|face pull|encogimiento|trapecio/.test(
      rawName
    )
  ) {
    return { primary: "back", secondary: "arms" };
  }

  if (
    rawBodyPart.includes("shoulder") ||
    rawBodyPart.includes("hombro") ||
    /militar|hombro|deltoide|elevaciones laterales|elevaciones frontales|arnold|p[aá]jaro/.test(
      rawName
    )
  ) {
    return { primary: "shoulders" };
  }

  if (
    rawBodyPart.includes("arm") ||
    rawBodyPart.includes("brazo") ||
    rawBodyPart.includes("biceps") ||
    rawBodyPart.includes("triceps") ||
    /curl|b[ií]ceps|tr[ií]ceps|franc[eé]s|copa|predicador|martillo|extensi[oó]n de codo|antebrazo/.test(
      rawName
    )
  ) {
    return { primary: "arms" };
  }

  if (
    rawBodyPart.includes("leg") ||
    rawBodyPart.includes("pierna") ||
    rawBodyPart.includes("glute") ||
    rawBodyPart.includes("calves") ||
    /sentadilla|prensa|pierna|cu[aá]driceps|femoral|isquio|peso muerto|hip thrust|gl[uú]teo|zancada|b[uú]lgara|gemelo|pantorrilla|abductor|aductor|hack/.test(
      rawName
    )
  ) {
    return { primary: "legs", secondary: "core" };
  }

  if (
    rawBodyPart.includes("core") ||
    rawBodyPart.includes("waist") ||
    rawBodyPart.includes("abs") ||
    /abdom|plancha|crunch|rueda abdominal|oblicuo|elevaci[oó]n de piernas|core/.test(
      rawName
    )
  ) {
    return { primary: "core" };
  }

  return { primary: null };
}

export default function BodyCompositionMap({
  records,
  onSelectPart,
  onRefresh,
}: BodyCompositionMapProps) {
  const { userProfile, trainingSessions } = useApp();
  const [exercises, setExercises] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"today" | "week">("today");
  const [focusedMuscle, setFocusedMuscle] = useState<string | null>(null);
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<MuscleKey | null>(
    null
  );

  useEffect(() => {
    getExercises().then(setExercises).catch(console.error);
  }, []);

  const currentRecord = records?.[0];
  const weight =
    currentRecord?.weightKg || (userProfile as any)?.currentWeightKg || 86.6;
  const waist = currentRecord?.waistCircumferenceCm || 90;
  const bodyFat = currentRecord?.bodyFatPercentage || 15.5;
  const height = userProfile?.heightCm || 180;
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

  const [isScanning, setIsScanning] = useState(false);

  // Calcular series y nivel de activación (0..1) según Rutina de Hoy (o última sesión) vs Últimos 7 días
  const { setsByGroup, activationMap, sessionBadgeLabel } = useMemo(() => {
    const emptySets: Record<MuscleKey, number> = {
      chest: 0,
      back: 0,
      shoulders: 0,
      arms: 0,
      core: 0,
      legs: 0,
    };

    const sessions = Array.isArray(trainingSessions)
      ? [...trainingSessions].sort(
          (a: any, b: any) =>
            new Date(b.workoutDate || 0).getTime() -
            new Date(a.workoutDate || 0).getTime()
        )
      : [];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;

    let targetSessions: any[] = [];
    let badge = "Sin entreno registrado";

    if (viewMode === "today") {
      const todaySessions = sessions.filter((s: any) => {
        if (!s.workoutDate) return false;
        const d = new Date(s.workoutDate);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
        return dStr === todayStr;
      });

      if (todaySessions.length > 0) {
        targetSessions = todaySessions;
        badge = "Entrenado Hoy 🔥";
      } else if (sessions.length > 0) {
        // Si aún no entrenó hoy, mostramos su última rutina completada para que vea sus músculos coloreados
        targetSessions = [sessions[0]];
        const lastDate = new Date(sessions[0].workoutDate);
        badge = `Última Rutina (${lastDate.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "short",
        })})`;
      }
    } else {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      targetSessions = sessions.filter(
        (s: any) => s.workoutDate && new Date(s.workoutDate) >= sevenDaysAgo
      );
      badge = `Acumulado 7 días (${targetSessions.length} sesiones)`;
    }

    targetSessions.forEach((session: any) => {
      (session.exerciseLogs || []).forEach((log: any) => {
        const sets =
          Number(log.setsDone) ||
          (Array.isArray(log.sets) ? log.sets.length : 0) ||
          3;
        const { primary, secondary } = classifyExerciseToMuscle(log, exercises);
        if (primary) {
          emptySets[primary] += sets;
        }
        if (secondary) {
          emptySets[secondary] += Math.max(1, Math.round(sets * 0.35));
        }
      });
    });

    const threshold = viewMode === "today" ? 8 : 16;
    const computedActivation: MuscleActivationMap = {
      chest: Math.min(1, emptySets.chest / threshold),
      back: Math.min(1, emptySets.back / threshold),
      shoulders: Math.min(1, emptySets.shoulders / threshold),
      arms: Math.min(1, emptySets.arms / threshold),
      core: Math.min(1, emptySets.core / threshold),
      legs: Math.min(1, emptySets.legs / threshold),
    };

    // Si el usuario tocó un botón de músculo específico para inspeccionarlo en 3D, resaltarlo al 100%
    if (selectedMuscleKey) {
      computedActivation[selectedMuscleKey] = 1.0;
    }

    return {
      setsByGroup: emptySets,
      activationMap: computedActivation,
      sessionBadgeLabel: badge,
    };
  }, [trainingSessions, exercises, viewMode, selectedMuscleKey]);

  const handleScan = async () => {
    setIsScanning(true);
    setSelectedMuscleKey(null);
    setFocusedMuscle(null);

    const performRefresh = async () => {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    };

    const refreshPromise = performRefresh();

    toast.promise(refreshPromise, {
      loading: "Sincronizando activación muscular 3D...",
      success: "Mapa muscular actualizado con tu entrenamiento.",
      error: "Error de conexión con la base de datos.",
    });

    try {
      await refreshPromise;
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleMuscleChipClick = (group: (typeof MUSCLE_GROUPS)[number]) => {
    if (selectedMuscleKey === group.key) {
      setSelectedMuscleKey(null);
      setFocusedMuscle(null);
      onSelectPart(null);
    } else {
      setSelectedMuscleKey(group.key);
      setFocusedMuscle(group.coachKey);
      onSelectPart(group.coachKey);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Cabecera compacta con Selector de Modo Muscular (Hoy vs 7 Días) */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <User size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm md:text-base font-bold text-foreground tracking-tight">
                Mapa Muscular 3D
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-500 border border-orange-500/25">
                {sessionBadgeLabel}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gira el modelo 360° o toca un músculo para iluminar las zonas trabajadas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Selector Hoy vs 7 Días */}
          <div className="flex items-center bg-muted dark:bg-black/40 p-1 rounded-xl border border-border dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setSelectedMuscleKey(null);
                setFocusedMuscle(null);
                setViewMode("today");
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewMode === "today"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame size={11} /> Hoy
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMuscleKey(null);
                setFocusedMuscle(null);
                setViewMode("week");
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewMode === "week"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays size={11} /> 7 Días
            </button>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Target size={13} />
                Sincronizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visor 3D */}
      <div className="relative w-full h-[450px] md:h-[490px] rounded-3xl overflow-hidden border border-border dark:border-white/10 group/scanner shadow-inner">
        {/* Fondo oscuro técnico */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d13] via-[#07080c] to-[#040507] z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)] z-0" />

        {/* Canvas 3D */}
        <div className="relative z-10 w-full h-full pb-12">
          <BodyScanner3D
            records={records}
            onSelectPart={onSelectPart}
            muscleActivation={activationMap}
            focusedMuscle={focusedMuscle}
          />
        </div>

        {/* Píldoras Biométricas Superiores */}
        <div className="absolute top-3 left-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col">
          <span className="text-[9px] font-bold tracking-wider text-orange-400 uppercase">
            Grasa est.
          </span>
          <span className="text-base md:text-lg font-black text-white tabular-nums">
            {bodyFat}
            <span className="text-[10px] font-medium text-gray-400 ml-0.5">%</span>
          </span>
        </div>

        <div className="absolute top-3 right-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col items-end">
          <span className="text-[9px] font-bold tracking-wider text-blue-400 uppercase">
            Peso
          </span>
          <span className="text-base md:text-lg font-black text-white tabular-nums">
            {weight}
            <span className="text-[10px] font-medium text-gray-400 ml-0.5">kg</span>
          </span>
        </div>

        <div className="absolute top-20 left-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col">
          <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">
            Cintura
          </span>
          <span className="text-base md:text-lg font-black text-white tabular-nums">
            {waist}
            <span className="text-[10px] font-medium text-gray-400 ml-0.5">cm</span>
          </span>
        </div>

        <div className="absolute top-20 right-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col items-end">
          <span className="text-[9px] font-bold tracking-wider text-purple-400 uppercase">
            IMC
          </span>
          <span className="text-base md:text-lg font-black text-white tabular-nums">
            {bmi}
            <span className="text-[10px] font-medium text-gray-400 ml-0.5">pts</span>
          </span>
        </div>

        {/* DOCK INFERIOR INTERACTIVO DE MÚSCULOS TRABAJADOS */}
        <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
          {MUSCLE_GROUPS.map((group) => {
            const sets = setsByGroup[group.key];
            const isWorked = sets > 0;
            const isSelected = selectedMuscleKey === group.key;

            return (
              <button
                key={group.key}
                type="button"
                onClick={() => handleMuscleChipClick(group)}
                className={`px-3 py-2 rounded-2xl backdrop-blur-md border transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? "bg-orange-500/90 border-orange-400 text-white shadow-lg shadow-orange-500/30 scale-105"
                    : isWorked
                    ? "bg-orange-500/20 border-orange-500/40 text-white hover:bg-orange-500/30"
                    : "bg-black/65 border-white/10 text-white/55 hover:text-white hover:border-white/25"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected
                      ? "bg-white animate-ping"
                      : isWorked
                      ? "bg-orange-500 shadow-[0_0_8px_#f97316]"
                      : "bg-slate-600"
                  }`}
                />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase leading-none">
                    {group.label}
                  </p>
                  <p className="text-[8px] font-bold opacity-75 mt-0.5">
                    {sets > 0 ? `${sets} series` : "Descanso"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
