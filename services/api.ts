// services/api.ts
const BASE_URL = 'http://localhost:8080/api';

// Obtener todos los registros del usuario (Alonso = ID 1)
export const getRecords = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/records/user/${userId}`);
  if (!response.ok) throw new Error('Error al obtener registros');
  return response.json();
};

// Obtener cálculos de nutrición
export const getNutrition = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/nutrition/calculate/${userId}`);
  if (!response.ok) throw new Error('Error al calcular nutrición');
  return response.json();
};

// Crear un nuevo registro de peso/cintura
export const createRecord = async (record: any) => {
  const response = await fetch(`${BASE_URL}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  });
  
  if (!response.ok) {
    throw new Error('No se pudo eliminar el registro de la base de datos');
  }
  return true; 
};