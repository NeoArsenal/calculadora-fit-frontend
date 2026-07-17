// services/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const getAuthHeaders = (includeContentType = true) => {
  const headers: Record<string, string> = {};
  if (includeContentType) headers['Content-Type'] = 'application/json';
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kallp_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Autenticación
export const loginUser = async (data: any) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error en el login');
  return response.json();
};

export const registerUser = async (data: any) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Error en el registro');
  }
  // Register returns plain text from backend: "User registered successfully!"
  return response.text();
};

// Obtener todos los registros del usuario (Alonso = ID 1)
export const getRecords = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/records/user/${userId}`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al obtener registros');
  return response.json();
};

// Obtener perfil de usuario
export const getUserProfile = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/profiles/${userId}`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al obtener perfil del usuario');
  return response.json();
};

// Actualizar parcialmente el perfil del usuario
export const updateUserProfile = async (userId: number, data: any) => {
  const response = await fetch(`${BASE_URL}/profiles/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar perfil del usuario');
  return response.json();
};

// Obtener cálculos de nutrición
export const getNutrition = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/nutrition/calculate/${userId}`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al calcular nutrición');
  return response.json();
};

// Crear un nuevo registro de peso/cintura
export const createRecord = async (record: any) => {
  const response = await fetch(`${BASE_URL}/records`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(record),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData; 
  }
  return response.json();
};

// --- LA PIEZA QUE FALTABA: ELIMINAR ---
export const deleteRecord = async (id: number) => {
  const response = await fetch(`${BASE_URL}/records/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });
  
  if (!response.ok) {
    throw new Error('No se pudo eliminar el registro de la base de datos');
  }
  return true; 
};

export const getGamification = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/users/${userId}/gamification`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al obtener datos de gamificación');
  return response.json();
};

export const addXp = async (userId: number, amount: number) => {
  const response = await fetch(`${BASE_URL}/users/${userId}/xp?amount=${amount}`, {
    method: 'POST',
    headers: getAuthHeaders(false)
  });
  if (!response.ok) throw new Error("Failed to add XP");
  return response.json();
};

// ⚡️ NUEVO: Obtener el volumen total de entrenamiento de los últimos 30 días
export const getTotalVolume = async (userId: number) => {
  // Asegúrate de que esta URL coincida con el endpoint que crearás en Spring Boot.
  const response = await fetch(`${BASE_URL}/users/${userId}/total-volume`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al obtener el volumen total');
  return response.json();
};

// 💧 HIDRATACIÓN: Obtener agua consumida hoy
export const getTodayWater = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/hydration/${userId}/today`, { headers: getAuthHeaders(false) });
  if (!response.ok) {
    // Para usuarios nuevos sin registro de hidratación, devolver 0
    return { amountMl: 0 };
  }
  try {
    return await response.json();
  } catch {
    // Si el body no es JSON válido, devolver default
    return { amountMl: 0 };
  }
};

// 💧 HIDRATACIÓN: Añadir agua
export const addWater = async (userId: number, amountMl: number) => {
  const response = await fetch(`${BASE_URL}/hydration/${userId}/add`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ amountMl }),
  });
  if (!response.ok) throw new Error('Error al añadir agua');
  return response.json();
};

// 💊 SUPLEMENTOS: Obtener lista
export const getSupplements = async () => {
  // Nota: Actualmente el endpoint backend no filtra por userId, devuelve todos.
  const response = await fetch(`${BASE_URL}/supplements`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al obtener suplementos');
  return response.json();
};

// 💊 SUPLEMENTOS: Consumir dosis
export const consumeSupplement = async (supplementId: number, servings: number = 1) => {
  const response = await fetch(`${BASE_URL}/supplements/consume/${supplementId}?servings=${servings}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al consumir suplemento');
  return response.json();
};

export const getSupplementLogs = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/supplements/logs/user/${userId}`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error fetching supplement logs');
  return response.json();
};

export const getWorkoutSessions = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/workout-sessions?userId=${userId}`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al obtener sesiones de entrenamiento');
  return response.json();
};

// 🏋️‍♀️ RUTINAS / PLANTILLAS
export const getRoutines = async () => {
  const response = await fetch(`${BASE_URL}/routines`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al obtener plantillas de rutinas');
  return response.json();
};

export const saveRoutine = async (routine: any) => {
  const response = await fetch(`${BASE_URL}/routines`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(routine),
  });
  if (!response.ok) throw new Error('Error al guardar plantilla de rutina');
  return response.json();
};

export const updateRoutineName = async (id: number, name: string) => {
  const response = await fetch(`${BASE_URL}/routines/${id}/name?name=${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al actualizar nombre de rutina');
  return response.json();
};

export const deleteRoutineTemplate = async (id: number) => {
  const response = await fetch(`${BASE_URL}/routines/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false),
  });
  if (!response.ok) throw new Error('Error al eliminar rutina');
  return true;
};

// 🔔 NOTIFICACIONES E INTELIGENCIA
export const getUserNotifications = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/notifications/user/${userId}`, { headers: getAuthHeaders(false) });
  if (!response.ok) throw new Error('Error al obtener notificaciones');
  return response.json();
};

export const markNotificationAsRead = async (id: number) => {
  const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al marcar notificación como leída');
  return true;
};

export const deleteNotification = async (id: number) => {
  const response = await fetch(`${BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al eliminar notificación');
  return true;
};