"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo } from "react";
import Hotspot from "./Hotspot";
import * as THREE from "three";

/* =========================
   🧠 PROPS
========================= */
interface BodyScannerProps {
  records: any[];
  onSelectPart: (part: "chest" | "waist" | null) => void;
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

  // ⚡️ 1. Calculamos el offset de forma SEGURA, sin modificar la 'scene'
  const centerOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    // Retornamos las coordenadas inversas para centrarlo
    return [-center.x, -center.y, -center.z] as const; 
  }, [scene]);
  
  // 🔥 Aplicar material UNA SOLA VEZ
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = hologramMaterial;
      }
    });
  }, [scene, hologramMaterial]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.004;
      hologramMaterial.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group ref={ref}>
      {/* ⚡️ 2. Aplicamos la corrección de posición al GRUPO PADRE, no a la escena */}
      <group position={centerOffset}>
        <primitive object={scene} scale={1.2} />
      </group>
      
      {/* ⚡️ 3. Los Hotspots se quedan aquí para rotar junto con el cuerpo */}
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
      <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>

        {/* 🌌 Luces */}
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 5]} color="cyan" intensity={2} />

           <HologramBody>
          
          {/* Pecho: Un poco arriba del centro exacto (0.6) */}
          <Hotspot
            position={[0, 0.5, 0.10]} 
            type="chest"
            label="PESO ACTUAL"
            value={`${currentWeight} kg`}
            onSelect={onSelectPart}
          />

          {/* Cintura: Casi en el centro exacto (-0.1) */}
          <Hotspot
            position={[0, 0.1, 0.10]} 
            type="waist"
            label="CINTURA"
            value={`${currentWaist} cm`}
            onSelect={onSelectPart}
          />

        </HologramBody>

        {/* 🎮 Controles */}
        <OrbitControls
          enableZoom={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />

        {/* ✨ Glow PRO */}
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.15} />
        </EffectComposer>

        {/* 🌌 Fondo */}
        <color attach="background" args={["#0a0f1c"]} />
      </Canvas>
    </div>
  );
}

/* 🔥 Preload del modelo */
useGLTF.preload("/models/human.glb");