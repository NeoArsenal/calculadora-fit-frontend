"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import Hotspot from "@/app/components/Hotspot";
import * as THREE from "three";
import { useApp } from "@/app/context/AppContext";
import { getExercises } from "@/app/(routes)/training/services/exerciseService";

/* =========================
   🔷 MODELO HOLOGRÁFICO
========================= */
function HologramBody({ children }: { children?: React.ReactNode }) {
  const { scene } = useGLTF("/models/human.glb");
  const ref = useRef<THREE.Group>(null!);

  const hologramMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: `
          varying vec3 vPosition;
          void main(){
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPosition;
          uniform float time;
          void main(){
            float scan = sin(vPosition.y * 10.0 - time * 4.0) * 0.1;
            vec3 color = vec3(0.0, 0.9, 1.0);
            gl_FragColor = vec4(color + scan * 0.6, 0.55);
          }
        `,
        transparent: true,
      }),
    []
  );
  
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = hologramMaterial;
      }
    });
  }, [scene, hologramMaterial]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      hologramMaterial.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group ref={ref}>
      <Center>
        <primitive object={scene} scale={1.2} />
      </Center>
      {children}
    </group>
  );
}

/* =========================
   🚀 ESCENA PRINCIPAL
========================= */
export default function MuscleScanner3D() {
  const { trainingSessions } = useApp();
  const [exercises, setExercises] = useState<any[]>([]);

  // Cargar catálogo de ejercicios para saber los músculos
  useEffect(() => {
    getExercises()
      .then(setExercises)
      .catch(console.error);
  }, []);

  const muscleData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = (trainingSessions || []).filter((s: any) => {
      if (!s.workoutDate) return false;
      return new Date(s.workoutDate) >= thirtyDaysAgo;
    });

    const setsByGroup = {
      chest: 0,
      back: 0,
      shoulders: 0,
      arms: 0,
      legs: 0,
      core: 0,
    };

    recentSessions.forEach((session: any) => {
      if (session.exerciseLogs) {
        session.exerciseLogs.forEach((log: any) => {
          const exercise = exercises.find(e => e.id === log.exerciseId);
          if (exercise && exercise.bodyPart) {
            const bodyPart = exercise.bodyPart.toLowerCase();
            // Asumimos que los sets válidos suman al volumen
            const sets = log.setsDone || 0;
            
            if (bodyPart.includes("chest")) setsByGroup.chest += sets;
            else if (bodyPart.includes("back")) setsByGroup.back += sets;
            else if (bodyPart.includes("shoulders")) setsByGroup.shoulders += sets;
            else if (bodyPart.includes("arm")) setsByGroup.arms += sets;
            else if (bodyPart.includes("leg")) setsByGroup.legs += sets;
            else if (bodyPart.includes("waist") || bodyPart.includes("core")) setsByGroup.core += sets;
          }
        });
      }
    });

    return setsByGroup;
  }, [trainingSessions, exercises]);

  // 🔥 Sistema de colores basado en volumen
  const getColor = (sets: number) => {
    if (sets === 0) return "#374151"; // Gris (Inactivo)
    if (sets < 10) return "#3b82f6"; // Azul (Volumen bajo/medio)
    if (sets < 20) return "#8b5cf6"; // Morado (Volumen óptimo)
    return "#ef4444"; // Rojo (Mucho volumen / Fuego)
  };

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-xl overflow-hidden bg-[#0a0f1c]/50">
      <Canvas camera={{ position: [0, 1, 4], fov: 45 }} dpr={[1, 1.5]}>

        {/* 🌌 Luces */}
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 5]} color="cyan" intensity={2} />

        <HologramBody>
          {/* Pecho */}
          <Hotspot 
            position={[0, 0.45, 0.12]} 
            label="Pecho" 
            value={`${muscleData.chest} series`} 
            color={getColor(muscleData.chest)} 
          />
          {/* Espalda (Atrás) */}
          <Hotspot 
            position={[0, 0.45, -0.15]} 
            label="Espalda" 
            value={`${muscleData.back} series`} 
            color={getColor(muscleData.back)} 
          />
          {/* Hombros */}
          <Hotspot 
            position={[0.25, 0.52, 0.0]} 
            label="Hombros" 
            value={`${muscleData.shoulders} series`} 
            color={getColor(muscleData.shoulders)} 
          />
          {/* Brazos */}
          <Hotspot 
            position={[-0.3, 0.2, 0.0]} 
            label="Brazos" 
            value={`${muscleData.arms} series`} 
            color={getColor(muscleData.arms)} 
          />
          {/* Piernas */}
          <Hotspot 
            position={[0.15, -0.4, 0.1]} 
            label="Piernas" 
            value={`${muscleData.legs} series`} 
            color={getColor(muscleData.legs)} 
          />
          {/* Core / Cintura */}
          <Hotspot 
            position={[0, 0.1, 0.12]} 
            label="Core" 
            value={`${muscleData.core} series`} 
            color={getColor(muscleData.core)} 
          />
        </HologramBody>

        {/* 🎮 Controles limitados */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/human.glb");
