"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '@/services/api';
import { getDashboardSummary } from '@/app/(routes)/nutrition/services/nutritionService';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import OnboardingWizard from '@/app/components/OnboardingWizard';

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [CURRENT_USER_ID, setCurrentUserId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [nutrition, setNutrition] = useState<any>(null);
  const [trainingSessions, setTrainingSessions] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({ 
    currentStreak: 0, 
    totalVolume: 0,
    xp: 0,
    level: 1,
    nextLevelXp: 100,
    rankName: 'Rookie'
  });
  const [nutritionSummary, setNutritionSummary] = useState<any>(null);
  const [supplements, setSupplements] = useState<any[]>([]);
  const [supplementLogs, setSupplementLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Load auth state from local storage
  useEffect(() => {
    const token = localStorage.getItem('kallp_token');
    const userId = localStorage.getItem('kallp_user_id');

    if (token && userId) {
      setCurrentUserId(parseInt(userId));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setCurrentUserId(null);
    }
    setAuthLoading(false);
  }, []);

  const login = (token: string, userId: number) => {
    localStorage.setItem('kallp_token', token);
    localStorage.setItem('kallp_user_id', userId.toString());
    setCurrentUserId(userId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('kallp_token');
    localStorage.removeItem('kallp_user_id');
    setCurrentUserId(null);
    setIsAuthenticated(false);
    
    // Limpiar estado
    setUserProfile(null);
    setRecords([]);
    
    router.push('/login');
  };

  const loadEcosystem = useCallback(async () => {
    if (!CURRENT_USER_ID || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const [
        profileData,
        recordsData,
        nutritionData,
        sessionsData,
        gamificationData,
        volumeData,
        nutriSummary,
        supplementsData,
        logsData,
        routinesData
      ] = await Promise.all([
        api.getUserProfile(CURRENT_USER_ID).catch(() => null),
        api.getRecords(CURRENT_USER_ID).catch(() => []),
        api.getNutrition(CURRENT_USER_ID).catch(() => null),
        api.getWorkoutSessions(CURRENT_USER_ID).catch(() => []),
        api.getGamification(CURRENT_USER_ID).catch(() => ({ currentStreak: 0 })),
        api.getTotalVolume(CURRENT_USER_ID).catch(() => ({ totalVolume: 0 })),
        getDashboardSummary(CURRENT_USER_ID).catch(() => null),
        api.getSupplements().catch(() => []),
        api.getSupplementLogs(CURRENT_USER_ID).catch(() => []),
        api.getRoutines().catch(() => [])
      ]);

      setUserProfile(profileData);
      setRecords(recordsData);
      setNutrition(nutritionData);
      setTrainingSessions(sessionsData);
      setAnalytics({
        currentStreak: gamificationData?.currentStreak ?? 0,
        totalVolume: volumeData?.totalVolume !== undefined ? volumeData.totalVolume : (volumeData || 0),
        xp: gamificationData?.xp ?? 0,
        level: gamificationData?.level ?? 1,
        nextLevelXp: gamificationData?.nextLevelXp ?? 100,
        rankName: gamificationData?.rankName ?? 'Rookie'
      });
      if (nutriSummary && nutriSummary.meals) {
        const today = new Date();
        const todayStr = today.getFullYear() + "-" + (today.getMonth()+1).toString().padStart(2, '0') + "-" + today.getDate().toString().padStart(2, '0');
        
        const filteredMeals = nutriSummary.meals.filter((m: any) => {
          const mDate = new Date(m.createdAt.endsWith('Z') ? m.createdAt : m.createdAt + 'Z');
          const mDateStr = mDate.getFullYear() + "-" + (mDate.getMonth()+1).toString().padStart(2, '0') + "-" + mDate.getDate().toString().padStart(2, '0');
          return mDateStr === todayStr;
        });

        const recalculatedTotals = filteredMeals.reduce((acc: any, m: any) => {
          acc.calories += (m.calories || 0);
          acc.protein += (m.protein || 0);
          acc.carbs += (m.carbs || 0);
          acc.fats += (m.fat || m.fats || 0);
          return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        nutriSummary.meals = filteredMeals;
        nutriSummary.totals = recalculatedTotals;
      }
      setNutritionSummary(nutriSummary);
      setSupplements(supplementsData);
      setSupplementLogs(logsData);
      setRoutines(routinesData);
    } catch (e) {
      console.error("Error loading ecosystem", e);
      if (e instanceof Error && e.message.includes('401')) {
        logout(); // Token expirado o inválido
      }
    } finally {
      setLoading(false);
    }
  }, [CURRENT_USER_ID, isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      loadEcosystem();
    }
  }, [loadEcosystem, authLoading]);

  // Proteger rutas
  useEffect(() => {
    if (!authLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, pathname, router]);

  const gainXp = async (amount: number) => {
    if (!CURRENT_USER_ID) return;
    try {
      const updatedGamification = await api.addXp(CURRENT_USER_ID, amount);
      
      const oldLevel = analytics?.level || 1;
      const newLevel = updatedGamification.level;
      
      if (newLevel > oldLevel) {
        toast.custom((t) => (
          <div className="w-full sm:w-auto flex items-center gap-3 bg-blue-900/40 border border-blue-500/40 rounded-xl p-4 shadow-[0_8px_30px_-4px_rgba(59,130,246,0.3)] backdrop-blur-xl animate-in slide-in-from-top-2">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <span className="text-xl">🎉</span>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">NUEVO NIVEL ALCANZADO</p>
              <p className="text-blue-100 font-bold text-sm">Nivel {newLevel} - {updatedGamification.rankName}</p>
            </div>
          </div>
        ));
      } else {
        toast.custom((t) => (
          <div className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-900/40 border border-emerald-500/40 rounded-xl px-4 py-3 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.2)] backdrop-blur-xl animate-in slide-in-from-top-2">
            <span className="text-emerald-400 font-black text-sm uppercase tracking-widest">✨ +{amount} XP OBTENIDA</span>
          </div>
        ));
      }

      setAnalytics((prev: any) => ({
        ...prev,
        xp: updatedGamification.xp,
        level: updatedGamification.level,
        nextLevelXp: updatedGamification.nextLevelXp,
        rankName: updatedGamification.rankName
      }));
    } catch (error) {
      console.error("Failed to gain XP", error);
    }
  };

  return (
    <AppContext.Provider value={{
      userProfile,
      records,
      nutrition,
      trainingSessions,
      analytics,
      nutritionSummary,
      supplements,
      supplementLogs,
      routines,
      loading: loading || authLoading,
      refreshEcosystem: loadEcosystem,
      gainXp,
      CURRENT_USER_ID,
      isAuthenticated,
      login,
      logout
    }}>
      {authLoading || (!isAuthenticated && pathname !== '/login' && pathname !== '/register') ? (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Render Onboarding Wizard si falta info crítica y estamos logueados */}
          {isAuthenticated && userProfile && (() => {
            const needsOnboarding = 
              !userProfile.heightCm || 
              !userProfile.targetWeightKg ||
              !userProfile.gender ||
              userProfile.gender === 'Not specified' ||
              !userProfile.activityLevel ||
              userProfile.activityLevel === 'Sedentary' && userProfile.primaryGoal === 'Maintain weight' && !userProfile.dateOfBirth;
            return needsOnboarding;
          })() && (
            <OnboardingWizard />
          )}
          {children}
        </>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
