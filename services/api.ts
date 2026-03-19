const BASE_URL = 'http://localhost:8080/api';

// 1. Obtener registros
export const getRecords = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/records/user/${userId}`);
  if (!response.ok) throw new Error('Error al obtener registros');
  return response.json();
};

// 2. Obtener nutrición
export const getNutrition = async (userId: number) => {
  const response = await fetch(`${BASE_URL}/nutrition/calculate/${userId}`);
  if (!response.ok) throw new Error('Error al calcular nutrición');
  return response.json();
};

// 3. Crear registro
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