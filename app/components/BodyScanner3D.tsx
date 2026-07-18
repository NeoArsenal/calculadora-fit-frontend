"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
// Postprocessing removed for performance
import { useRef, useMemo } from "react";
import Hotspot from "./Hotspot";
import * as THREE from "three";

/* =========================
   🧠 PROPS
========================= */
interface BodyScannerProps {
  records: any[];
  onSelectPart: (part: string | null) => void;
}

/* =========================
   🔷 MODELO HOLOGRÁFICO
========================= */
function HologramBody({ children }: { children?: React.ReactNode }) {
  const { scene } = useGLTF("/models/human.glb");
  const ref = useRef<THREE.Group>(null!);

  // 🔥 Shader holográfico
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


  
  // 🔥 Aplicar material UNA SOLA VEZ
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = hologramMaterial;
      }
    });
  }, [scene, hologramMaterial]);

  // 🔥 Auto-rotación DETERMINISTA basada en el reloj global
  // Antes usábamos `rotation.y += 0.004` (incremental), que se desincronizaba
  // con OrbitControls y causaba el drift. Ahora usamos un valor ABSOLUTO.
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
import { useApp } from "@/app/context/AppContext";
import { getExercises } from "@/app/(routes)/training/services/exerciseService";
import { useState, useEffect } from "react";

export default function BodyScanner3D({
  records,
  onSelectPart,
}: BodyScannerProps) {
  const currentRecord = records?.[0] || null;
  const currentWeight = currentRecord?.weightKg || 86.6;
  const currentWaist = currentRecord?.waistCircumferenceCm || 90;

  const { trainingSessions } = useApp();
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    getExercises().then(setExercises).catch(console.error);
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

  const getColor = (sets: number) => {
    if (sets === 0) return "#374151"; 
    if (sets < 10) return "#3b82f6"; 
    if (sets < 20) return "#8b5cf6"; 
    return "#ef4444"; 
  };

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas camera={{ position: [0, 1, 4], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 5]} color="cyan" intensity={2} />

        <HologramBody>
          {/* Métricas Principales (Legacy) */}
          <Hotspot position={[0, 0.5, 0.15]} type="chest" label="PESO ACTUAL" value={`${currentWeight} kg`} onSelect={onSelectPart} />
          <Hotspot position={[0, 0.1, 0.15]} type="waist" label="CINTURA" value={`${currentWaist} cm`} onSelect={onSelectPart} />
          
          {/* Radar Muscular (Nuevos Hotspots de Energía) */}
          <Hotspot position={[0, 0.45, -0.15]} type="espalda" label="Espalda" value={`${muscleData.back} series`} color={getColor(muscleData.back)} onSelect={onSelectPart} />
          <Hotspot position={[0.25, 0.52, 0.0]} type="hombros" label="Hombros" value={`${muscleData.shoulders} series`} color={getColor(muscleData.shoulders)} onSelect={onSelectPart} />
          <Hotspot position={[-0.3, 0.2, 0.0]} type="brazos" label="Brazos" value={`${muscleData.arms} series`} color={getColor(muscleData.arms)} onSelect={onSelectPart} />
          <Hotspot position={[0.15, -0.4, 0.1]} type="piernas" label="Piernas" value={`${muscleData.legs} series`} color={getColor(muscleData.legs)} onSelect={onSelectPart} />
        </HologramBody>

        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
        <color attach="background" args={["transparent"]} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/human.glb");