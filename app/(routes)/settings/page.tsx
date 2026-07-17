"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import { updateUserProfile } from "@/services/api";
import { toast } from "sonner";
import { Settings2, User, Ruler, Flame, Target, Save, Activity, Scale, AlertTriangle, TrendingDown, TrendingUp, Minus, Repeat2, LogOut } from "lucide-react";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentario", desc: "Oficina, sin ejercicio", icon: "🪑" },
  { value: "light",     label: "Ligera",     desc: "1-3 días/semana",       icon: "🚶" },
  { value: "moderate",  label: "Moderada",   desc: "3-5 días/semana",       icon: "🏃" },
  { value: "active",    label: "Activa",     desc: "6-7 días/semana",       icon: "🔥" },
];

const GOAL_OPTIONS = [
  { value: "Deficit",     label: "Quemar Grasa",  icon: TrendingDown, color: "orange" },
  { value: "Maintenance", label: "Mantener",      icon: Minus,        color: "blue" },
  { value: "Superavit",   label: "Ganar Masa",    icon: TrendingUp,   color: "emerald" },
];

import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function SettingsPage() {
  const { userProfile, CURRENT_USER_ID, refreshEcosystem, logout } = useApp();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    heightCm: 0,
    targetWeightKg: 0,
    targetCalories: 2500,
    activityLevel: "",
    primaryGoal: "",
  });

  // Init form from userProfile
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        heightCm: userProfile.heightCm || 0,
        targetWeightKg: userProfile.targetWeightKg || 0,
        targetCalories: userProfile.targetCalories || 2500,
        activityLevel: userProfile.activityLevel || "",
        primaryGoal: userProfile.primaryGoal || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["heightCm", "targetWeightKg", "targetCalories"].includes(name) 
        ? Number(value) 
        : value,
    }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CURRENT_USER_ID) return;

    try {
      setLoading(true);
      await updateUserProfile(CURRENT_USER_ID, formData);
      await refreshEcosystem();
      
      toast.success("Perfil actualizado con éxito", {
        style: { 
            background: 'rgba(16, 185, 129, 0.05)', 
            color: '#34d399', 
            border: '1px solid rgba(52, 211, 153, 0.2)',
            backdropFilter: 'blur(12px)',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 8px 32px -4px rgba(16, 185, 129, 0.2)'
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-gray-900 dark:text-white flex items-center gap-3 transition-colors">
            <Settings2 className="text-blue-500 w-10 h-10 md:w-12 md:h-12" />
            PERFIL Y AJUSTES_
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Configuración del Ecosistema Kallp</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-[#0f0f11] px-4 py-2 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tema Visual</span>
          <ThemeToggle />
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-white dark:bg-[#0f0f11] border border-gray-200 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-[2.5rem] p-6 md:p-8 backdrop-blur-md transition-colors duration-300">
        <h3 className="text-gray-900 dark:text-white font-black italic uppercase text-lg tracking-tight mb-8 transition-colors">Datos Biométricos y Metas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <User size={12} className="text-blue-500"/> Nombre Completo
            </label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="Ej. Alonso"
              required
            />
          </div>

          {/* Altura */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Ruler size={12} className="text-emerald-500"/> Estatura (cm)
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="heightCm" 
                value={formData.heightCm || ""} 
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                placeholder="Ej. 175"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">cm</span>
            </div>
          </div>

          {/* Peso Objetivo */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Scale size={12} className="text-amber-500"/> Peso Objetivo
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="targetWeightKg" 
                step="0.1"
                value={formData.targetWeightKg || ""} 
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                placeholder="Ej. 75"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">kg</span>
            </div>
          </div>

          {/* Calorias Meta */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Flame size={12} className="text-pink-500"/> Meta Calórica Diaria
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="targetCalories" 
                value={formData.targetCalories || ""} 
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 pr-14 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                placeholder="Ej. 2500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">kcal</span>
            </div>
          </div>

          {/* Nivel de Actividad — TARJETAS */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity size={12} className="text-purple-500"/> Nivel de Actividad
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => handleFieldChange('activityLevel', opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                    formData.activityLevel === opt.value
                      ? 'border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                      : 'border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="text-lg mb-0.5">{opt.icon}</div>
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-[10px] opacity-60">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Objetivo Principal — TARJETAS */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Target size={12} className="text-red-500"/> Objetivo Principal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = formData.primaryGoal === opt.value;
                const colorMap: Record<string, { active: string; border: string }> = {
                  orange:  { active: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/50", border: "hover:border-orange-300 dark:hover:border-orange-500/30" },
                  blue:    { active: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/50",       border: "hover:border-blue-300 dark:hover:border-blue-500/30" },
                  emerald: { active: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/50", border: "hover:border-emerald-300 dark:hover:border-emerald-500/30" },
                };
                const colors = colorMap[opt.color];

                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleFieldChange('primaryGoal', opt.value)}
                    className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                      isActive 
                        ? `${colors.active} shadow-lg` 
                        : `border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] text-gray-500 dark:text-white/40 ${colors.border}`
                    }`}
                  >
                    <Icon size={24} className="mx-auto mb-2" />
                    <div className="font-bold text-sm">{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ⚡️ SMART WARNINGS ALGORITHM */}
        {(() => {
          let warning = "";
          const cal = formData.targetCalories;
          const goal = formData.primaryGoal;
          
          if ((goal === "Deficit") && cal > 2500) {
            warning = "Has seleccionado Quemar Grasa, pero tus calorías superan las 2500. Es probable que entres en superávit y ganes peso. Considera bajar a ~2000 kcal.";
          } else if ((goal === "Superavit") && cal < 2200) {
            warning = "Has seleccionado Ganar Masa, pero tus calorías son muy bajas. Tu cuerpo no tendrá energía para construir músculo. Considera subir a ~2800+ kcal.";
          }

          if (!warning) return null;

          return (
            <div className="mt-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 leading-relaxed">
                <strong className="block uppercase tracking-wider text-[10px] mb-1">Análisis de Meta Detecta Conflicto</strong>
                {warning}
              </p>
            </div>
          );
        })()}

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => {
              logout(); // Call the logout from context directly
              window.location.href = '/login';
            }}
            className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              <Save size={16} fill="currentColor" />
            )}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
