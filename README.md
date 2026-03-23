# ⚡ Kallp Elite - Fitness Intelligence Dashboard
**Kallp Elite** es una plataforma integral para atletas de alto rendimiento que fusiona la **Visión Computacional** y la **Inteligencia Artificial** para optimizar la nutrición y el rendimiento físico. 

Este proyecto forma parte del ecosistema de desarrollo de **Ingeniería de Sistemas Computacionales (8vo Ciclo - UPN)**.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🚀 Logros Actuales (Fase 1: Core Nutrition)

Hemos consolidado la arquitectura base del sistema, logrando una integración fluida entre el cliente y el servidor:

### 👁️ Kallp AI Vision (Frontend)
- **Escaneo en Tiempo Real:** Implementación de acceso a cámara mediante `MediaDevices API` y captura de frames mediante `Canvas`.
- **Servicios de Comunicación:** Desarrollo de `scanMeal` y `saveMeal` utilizando `Fetch API` y manejo de `FormData`.
- **UI Blindada:** Componentes reactivos con manejo de estados para errores de API y validación de datos (anti-NaN) en el Dashboard.

### 🧠 Backend Intelligence (Spring Boot)
- **Integración LogMeal API:** Implementación de `RestClient` para consumo asíncrono de Deep Learning enfocado en reconocimiento de alimentos.
- **Gestión de Errores:** Sistema de detección de Error 429 (Too Many Requests) para informar al usuario sobre el límite de tokens.
- **Arquitectura de Persistencia:** Modelado de datos con **JPA/Hibernate** y base de datos **PostgreSQL** para el almacenamiento de ingestas diarias.

### 📊 Dashboard Dinámico
- Visualización de macronutrientes mediante **Recharts**.
- Sincronización automática de datos históricos al cargar la aplicación (`useEffect` + `Spring Data JPA`).

---

## 📅 Roadmap: Lo que falta por hacer

Para alcanzar el nivel **Pro**, el plan de despliegue incluye:

- [ ] **💧 Módulo de Hidratación:** Registro dinámico de consumo de agua con persistencia en DB y visualización animada del cilindro de carga.
- [ ] **⚖️ Perfil Físico Dinámico:** Integración de la lógica de "Targets" basada en `PhysicalRecord` (Peso, Altura, Edad) para cálculos personalizados.
- [ ] **🔐 Auth & Security:** Implementación de seguridad a nivel de endpoint para perfiles de usuario individuales.
- [ ] **📈 Gráficas de Rendimiento:** Comparativa semanal de progreso calórico y muscular.

---

## 🛠️ Cosas a Mejorar (Ingeniería de Calidad)

1.  **Optimización de API Keys:** Implementar una lógica de rotación automática de APIUsers de LogMeal para maximizar los escaneos diarios gratuitos.
2.  **Refactorización con Lombok:** Reducir el código boilerplate en las entidades de Java para mejorar la legibilidad.
3.  **Skeleton Screens:** Mejorar la UX añadiendo estados de carga visual mientras la IA procesa la imagen.
4.  **Unit Testing:** Añadir pruebas unitarias con JUnit y Mockito para asegurar la estabilidad del Service de IA.

---

## 🏗️ Arquitectura del Sistema

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Recharts, Lucide React.
- **Backend:** Java 21, Spring Boot 3.x, Spring Data JPA.
- **Base de Datos:** PostgreSQL.
- **IA Engine:** LogMeal API (Image Recognition & Nutritional Analysis).

---

### 📥 Instalación Rápida
1. Clona el repositorio.
2. Configura el `application.properties` con tu conexión a PostgreSQL.
3. Ejecuta el Backend: `./mvnw spring-boot:run`
4. Ejecuta el Frontend: `npm install && npm run dev`

---
**Desarrollado por Alonso** - *Engineering Student at Universidad Privada del Norte*
