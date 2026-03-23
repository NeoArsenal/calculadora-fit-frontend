# ⚡ Kallp Elite - Biopsychological Optimization System

**Kallp Elite** es una plataforma integral para atletas de alto rendimiento que fusiona la **Visión Computacional** y la **Inteligencia Artificial** para optimizar la nutrición, el seguimiento biométrico y el rendimiento físico. 

Este proyecto forma parte del ecosistema de desarrollo de **Ingeniería de Sistemas Computacionales (8vo Ciclo - UPN)**.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## 🚀 Logros Actuales (Fase 1: Core Nutrition & Dashboard Architecture)

Hemos consolidado la arquitectura base del sistema, logrando una integración fluida entre el cliente y el servidor, priorizando patrones de diseño escalables y una UX premium:

### 👁️ Kallp AI Vision (Nutrición)
- **Escaneo en Tiempo Real:** Implementación de acceso a cámara mediante `MediaDevices API` y captura de frames mediante `Canvas`.
- **Servicios de Comunicación:** Desarrollo de `scanMeal` y `saveMeal` utilizando `Fetch API` y manejo de `FormData`.
- **Integración LogMeal API:** Implementación de `RestClient` en Spring Boot para consumo asíncrono de Deep Learning enfocado en reconocimiento de alimentos, con gestión de errores 429 (Too Many Requests).

### 🧬 Dashboard Biométrico & UX Premium
- **Mapa de Composición 3D:** Visualizador interactivo implementado con `dynamic imports` (para evitar errores de SSR en Next.js), mostrando métricas en tiempo real.
- **Sistema de Notificaciones Asíncronas:** Implementación de `Sonner` con promesas (`toast.promise`) para dar feedback visual instantáneo (estados de carga, éxito y error) durante las peticiones HTTP al servidor.
- **Soporte Dark/Light Mode Dinámico:** Integración de `next-themes` con variables de diseño nativas de Shadcn UI (`bg-background`, `bg-card`) y Tailwind (`dark:`) para mantener la identidad visual cyberpunk en modo oscuro y el minimalismo en modo claro.

### 🎮 Gamification Engine (Full-Stack)
- **Lógica de Rachas (Streaks) Segura:** Desplazamiento de la regla de negocio al Backend (Spring Boot) para evitar manipulación en el cliente. Uso del principio *Single Source of Truth* calculando días consecutivos dinámicamente desde el `PhysicalRecordRepository`.
- **Patrón DTO:** Estructuración de datos a través de `GamificationDTO` y `BadgeDTO` para enviar respuestas JSON optimizadas al frontend sin exponer las entidades de la base de datos.
- **Renderizado Reactivo:** Mapeo dinámico de iconos (Lucide React) y barras de progreso (`Progress` de Shadcn) basadas en el cálculo del servidor.

---

## 📅 Roadmap: Lo que falta por hacer

Para alcanzar el nivel **Pro**, el plan de despliegue incluye:

- [ ] **🏋️‍♂️ Módulo de Entrenamiento (Routine Planner):** Construcción del grid arquitectónico (Route Groups de Next.js) para planificador semanal y gráficos de curvas de fuerza máxima (`Recharts`).
- [ ] **💧 Módulo de Hidratación:** Registro dinámico de consumo de agua con persistencia en DB y visualización animada del cilindro de carga.
- [ ] **⚖️ Perfil Físico Dinámico:** Integración de la lógica de "Targets" basada en `PhysicalRecord` (Peso, Altura, Edad) para cálculos personalizados.
- [ ] **🔐 Auth & Security:** Implementación de seguridad a nivel de endpoint para perfiles de usuario individuales (JWT/Spring Security).

---

## 🛠️ Cosas a Mejorar (Ingeniería de Calidad)

1. **Optimización de API Keys:** Implementar una lógica de rotación automática de APIUsers de LogMeal para maximizar los escaneos diarios gratuitos.
2. **Refactorización con Lombok:** Reducir el código boilerplate en las entidades de Java para mejorar la legibilidad.
3. **Skeleton Screens & Suspense:** Expandir el uso de `<DashboardSkeleton />` a las nuevas vistas de enrutamiento para mejorar el *First Contentful Paint* (FCP).
4. **Unit Testing:** Añadir pruebas unitarias con JUnit y Mockito para asegurar la estabilidad del Service de IA y del algoritmo de cálculo de rachas.

---

## 🏗️ Arquitectura del Sistema

- **Frontend:** Next.js 14 (App Router, Route Groups), Tailwind CSS, Shadcn UI, Recharts, Sonner.
- **Backend:** Java 21, Spring Boot 3.x, Spring Data JPA.
- **Base de Datos:** PostgreSQL.
- **IA Engine:** LogMeal API (Image Recognition & Nutritional Analysis).

---

### 📥 Instalación Rápida
1. Clona el repositorio.
2. Configura el `application.properties` con tu conexión a PostgreSQL.
3. Ejecuta el Backend: `./mvnw spring-boot:run`
4. Instala las dependencias de UI: `npm install`
5. Ejecuta el Frontend: `npm run dev`

---
**Desarrollado por Alonso** - *Engineering Student at Universidad Privada del Norte*
