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
export default function BodyScanner3D({
  records,
  onSelectPart,
}: BodyScannerProps) {
  const currentRecord = records?.[0] || null;

  const currentWeight = currentRecord?.weightKg || 86.6;
  const currentWaist = currentRecord?.waistCircumferenceCm || 90;

  return (
    <div className="w-full h-full min-h-[300px] relative">
      {/* ⚡️ Optimizamos el Canvas limitando el DPR (Device Pixel Ratio) para evitar que celulares se congelen intentando renderizar 4K */}
      <Canvas camera={{ position: [0, 1, 4], fov: 45 }} dpr={[1, 1.5]}>

        {/* 🌌 Luces */}
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 5]} color="cyan" intensity={2} />

        <HologramBody>
          {/* Pecho */}
          <Hotspot
            position={[0, 0.5, 0.10]} 
            type="chest"
            label="PESO ACTUAL"
            value={`${currentWeight} kg`}
            onSelect={onSelectPart}
          />

          {/* Cintura */}
          <Hotspot
            position={[0, 0.1, 0.10]} 
            type="waist"
            label="CINTURA"
            value={`${currentWaist} cm`}
            onSelect={onSelectPart}
          />
        </HologramBody>

        {/* 🎮 Controles — BLOQUEADOS para evitar que el modelo se mueva de lugar */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />

        {/* ⚡️ EffectComposer (Bloom) eliminado temporalmente. 
            El post-procesamiento era la causa del congelamiento del navegador porque 
            fuerza a la tarjeta gráfica a renderizar la escena múltiples veces por frame. */}

        {/* 🌌 Fondo */}
        <color attach="background" args={["#0a0f1c"]} />
      </Canvas>
    </div>
  );
}

/* 🔥 Preload del modelo */
useGLTF.preload("/models/human.glb");