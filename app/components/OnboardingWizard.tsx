"use client";

import { useState } from "react";
import { User, Ruler, Activity, Target, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Flame, Scale, Zap, Dumbbell, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import * as api from "@/services/api";
import { calculateTDEE } from "@/app/utils/calculations";
import { ThemeToggle } from "./ThemeToggle";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentario", desc: "Oficina, sin ejercicio", icon: "🪑", color: "text-gray-400 border-gray-500/30 bg-gray-500/5" },
  { value: "light",     label: "Ligera",     desc: "1-3 días/semana",       icon: "🚶", color: "text-sky-400 border-sky-500/30 bg-sky-500/5" },
  { value: "moderate",  label: "Moderada",   desc: "3-5 días/semana",       icon: "🏃", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
  { value: "active",    label: "Activa",     desc: "6-7 días/semana",       icon: "🔥", color: "text-orange-400 border-orange-500/30 bg-orange-500/5" },
];

const GOAL_OPTIONS = [
  { value: "Deficit",     label: "Quemar Grasa",  icon: TrendingDown, color: "orange", gradient: "from-orange-500/20 to-red-500/10", borderActive: "border-orange-500", textActive: "text-orange-400" },
  { value: "Maintenance", label: "Mantener",      icon: Minus,        color: "blue",   gradient: "from-blue-500/20 to-cyan-500/10", borderActive: "border-blue-500",   textActive: "text-blue-400" },
  { value: "Superavit",   label: "Ganar Masa",    icon: TrendingUp,   color: "emerald",gradient: "from-emerald-500/20 to-green-500/10", borderActive: "border-emerald-500", textActive: "text-emerald-400" },
];

export default function OnboardingWizard() {
  const { userProfile, CURRENT_USER_ID, refreshEcosystem } = useApp();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1); // 1=forward, -1=back
  
  const [formData, setFormData] = useState({
    name: (userProfile?.name && userProfile.name !== "Admin") ? userProfile.name : "",
    gender: (userProfile?.gender && userProfile.gender !== "Not specified") ? userProfile.gender : "",
    dateOfBirth: (userProfile?.dateOfBirth && userProfile.dateOfBirth !== "2000-01-01") ? userProfile.dateOfBirth : "",
    heightCm: "",
    currentWeight: "",
    activityLevel: (userProfile?.activityLevel && userProfile.activityLevel !== "Sedentary") ? userProfile.activityLevel : "",
    primaryGoal: (userProfile?.primaryGoal && userProfile.primaryGoal !== "Maintain weight") ? userProfile.primaryGoal : "",
    targetWeightKg: "",
    targetCalories: "",
  });

  const TOTAL_STEPS = 4;

  const nextStep = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculateAndSubmit = async () => {
    setLoading(true);
    try {
      const currentWeightNum = parseFloat(formData.currentWeight);
      const heightNum = parseFloat(formData.heightCm);
      const targetWeightNum = parseFloat(formData.targetWeightKg);
      
      const birthYear = new Date(formData.dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      const tdee = calculateTDEE(currentWeightNum, heightNum, age, formData.gender, formData.activityLevel);
      
      let targetCals = tdee;
      if (formData.primaryGoal === "Deficit") targetCals = tdee - 500;
      if (formData.primaryGoal === "Superavit") targetCals = tdee + 300;

      await api.updateUserProfile(CURRENT_USER_ID, {
        name: formData.name,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        heightCm: heightNum,
        activityLevel: formData.activityLevel,
        primaryGoal: formData.primaryGoal,
        targetWeightKg: targetWeightNum,
        targetCalories: Math.round(targetCals)
      });

      if (currentWeightNum > 0) {
        await api.createRecord({
          userProfile: { id: CURRENT_USER_ID },
          weightKg: currentWeightNum
        });
      }

      await refreshEcosystem();
      
    } catch (error) {
      console.error("Error en onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step dot indicators
  const StepDots = () => (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS + 1 }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
          i === step ? 'w-8 bg-blue-500' : i < step ? 'w-3 bg-blue-500/40' : 'w-3 bg-white/10'
        }`} />
      ))}
    </div>
  );

  const animClass = direction > 0
    ? "animate-in slide-in-from-right-8 fade-in duration-300"
    : "animate-in slide-in-from-left-8 fade-in duration-300";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-2xl p-4 md:p-8">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-500/8 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg bg-[#0a0a0f]/95 border border-white/[0.06] shadow-[0_32px_128px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden relative flex flex-col" style={{ minHeight: "min(600px, 85vh)" }}>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/5 h-0.5 absolute top-0 left-0 z-10">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-x-hidden overflow-y-auto flex flex-col p-6 md:p-8 pt-10">
            
            {/* STEP 0: BIENVENIDA */}
            {step === 0 && (
              <div key="s0" className={`flex flex-col h-full items-center justify-center text-center ${animClass}`}>
                <StepDots />
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)] rotate-3">
                  <Zap size={36} className="text-blue-400 -rotate-3" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">
                  Bienvenido a Kallp<span className="text-blue-500">:</span>
                </h1>
                <p className="text-white/40 mb-8 text-sm md:text-base max-w-sm leading-relaxed">
                  Calibremos tu motor biométrico. Solo tomará un minuto.
                </p>
                <div className="w-full text-left">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Tu nombre</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Ej. Alonso"
                    autoFocus
                  />
                </div>

                {/* THEME TOGGLE */}
                <div className="w-full text-left mt-6 flex flex-row items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Tema Visual</label>
                    <p className="text-xs text-white/40 mt-1">Elige tu estilo para entrenar</p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            )}

            {/* STEP 1: BIOMETRÍA */}
            {step === 1 && (
              <div key="s1" className={`flex flex-col h-full justify-center ${animClass}`}>
                <StepDots />
                <h2 className="text-2xl md:text-3xl font-black mb-1 text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Ruler size={20} className="text-violet-400"/>
                  </div>
                  Biometría
                </h2>
                <p className="text-white/30 mb-6 text-sm">Tu metabolismo basal depende de estos factores.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Género biológico</label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button 
                        onClick={() => handleChange('gender', 'M')} 
                        className={`p-4 rounded-2xl border font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                          formData.gender === 'M' 
                            ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                            : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="text-xl">♂</span> Hombre
                      </button>
                      <button 
                        onClick={() => handleChange('gender', 'F')} 
                        className={`p-4 rounded-2xl border font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                          formData.gender === 'F' 
                            ? 'border-pink-500/50 bg-pink-500/10 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.1)]' 
                            : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="text-xl">♀</span> Mujer
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Fecha de nacimiento</label>
                    <input 
                      type="date" 
                      value={formData.dateOfBirth} 
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className="w-full mt-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 font-bold text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/30 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FÍSICO */}
            {step === 2 && (
              <div key="s2" className={`flex flex-col h-full justify-center ${animClass}`}>
                <StepDots />
                <h2 className="text-2xl md:text-3xl font-black mb-1 text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Scale size={20} className="text-emerald-400"/>
                  </div>
                  Tu Físico
                </h2>
                <p className="text-white/30 mb-6 text-sm">Tu punto de partida para trazar la ruta.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Altura</label>
                    <div className="relative mt-2">
                      <input 
                        type="number" 
                        value={formData.heightCm} 
                        onChange={(e) => handleChange('heightCm', e.target.value)}
                        placeholder="175"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 pr-14 font-black text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-3xl text-center transition-all placeholder:text-white/10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold text-sm">cm</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Peso actual</label>
                    <div className="relative mt-2">
                      <input 
                        type="number" step="0.1"
                        value={formData.currentWeight} 
                        onChange={(e) => handleChange('currentWeight', e.target.value)}
                        placeholder="80.5"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 pr-14 font-black text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-3xl text-center transition-all placeholder:text-white/10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold text-sm">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: METAS */}
            {step === 3 && (
              <div key="s3" className={`flex flex-col h-full justify-center ${animClass}`}>
                <StepDots />
                <h2 className="text-2xl md:text-3xl font-black mb-1 text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Target size={20} className="text-orange-400"/>
                  </div>
                  Tu Objetivo
                </h2>
                <p className="text-white/30 mb-5 text-sm">Define tu nivel de actividad y meta.</p>
                
                <div className="space-y-5">
                  {/* Activity Level — Cards instead of <select> */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Actividad semanal</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {ACTIVITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleChange('activityLevel', opt.value)}
                          className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                            formData.activityLevel === opt.value
                              ? `${opt.color} shadow-[0_0_15px_rgba(255,255,255,0.03)]`
                              : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10'
                          }`}
                        >
                          <div className="text-lg mb-0.5">{opt.icon}</div>
                          <div className="font-bold text-sm">{opt.label}</div>
                          <div className="text-[10px] opacity-60">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Goal */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Tu gran objetivo</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {GOAL_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = formData.primaryGoal === opt.value;
                        return (
                          <button 
                            key={opt.value}
                            onClick={() => handleChange('primaryGoal', opt.value)} 
                            className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                              isActive 
                                ? `${opt.borderActive} bg-gradient-to-b ${opt.gradient} ${opt.textActive}` 
                                : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10'
                            }`}
                          >
                            <Icon size={20} className="mx-auto mb-1" />
                            <div className="font-bold text-xs">{opt.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Weight */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">Peso objetivo</label>
                    <div className="relative mt-2">
                      <input 
                        type="number" step="0.1"
                        value={formData.targetWeightKg} 
                        onChange={(e) => handleChange('targetWeightKg', e.target.value)}
                        placeholder="75"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 pr-14 font-black text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 outline-none text-2xl text-center transition-all placeholder:text-white/10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold text-sm">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: FINALIZAR */}
            {step === 4 && (
              <div key="s4" className={`flex flex-col h-full items-center justify-center text-center ${animClass}`}>
                {/* Animated checkmark */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-green-500/5 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.15)] rotate-6">
                    <CheckCircle2 size={48} className="text-emerald-400 -rotate-6" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-xs text-white font-black">✓</span>
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black mb-3 text-white">Todo Listo</h2>
                <p className="text-white/30 mb-4 text-sm max-w-xs leading-relaxed">
                  Tu ecosistema biométrico se está configurando con tus datos personalizados.
                </p>

                {/* Summary preview */}
                <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-6 text-left">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-white/30">Nombre</span>
                      <div className="font-bold text-white">{formData.name || "—"}</div>
                    </div>
                    <div>
                      <span className="text-white/30">Género</span>
                      <div className="font-bold text-white">{formData.gender === 'M' ? '♂ Hombre' : formData.gender === 'F' ? '♀ Mujer' : '—'}</div>
                    </div>
                    <div>
                      <span className="text-white/30">Altura</span>
                      <div className="font-bold text-white">{formData.heightCm ? `${formData.heightCm} cm` : '—'}</div>
                    </div>
                    <div>
                      <span className="text-white/30">Peso actual</span>
                      <div className="font-bold text-white">{formData.currentWeight ? `${formData.currentWeight} kg` : '—'}</div>
                    </div>
                    <div>
                      <span className="text-white/30">Meta</span>
                      <div className="font-bold text-white">{formData.targetWeightKg ? `${formData.targetWeightKg} kg` : '—'}</div>
                    </div>
                    <div>
                      <span className="text-white/30">Objetivo</span>
                      <div className="font-bold text-white">{GOAL_OPTIONS.find(g => g.value === formData.primaryGoal)?.label || '—'}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCalculateAndSubmit}
                  disabled={loading}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 size={20} className="animate-spin" /> Configurando...</>
                  ) : (
                    <><Zap size={20} /> Inicializar Kallp</>
                  )}
                </button>
              </div>
            )}

        </div>

        {/* Navigation Buttons (Hidden on step 4) */}
        {step < TOTAL_STEPS && (
          <div className="p-4 md:p-6 border-t border-white/[0.04] flex justify-between items-center bg-[#0a0a0f]/80 backdrop-blur-md">
            <button 
              onClick={prevStep} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                step === 0 
                  ? 'opacity-0 pointer-events-none' 
                  : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-white/60 hover:text-white'
              }`}
            >
              <ArrowLeft size={18} />
            </button>

            {/* Step counter */}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              {step + 1} / {TOTAL_STEPS + 1}
            </span>

            <button 
              onClick={nextStep}
              className="h-12 px-6 rounded-xl bg-white text-black font-black text-sm flex items-center gap-2 hover:bg-white/90 active:scale-[0.97] transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
            >
              {step === 3 ? 'Revisar' : 'Siguiente'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
