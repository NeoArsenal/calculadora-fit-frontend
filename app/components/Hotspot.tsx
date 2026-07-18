"use client";

import { Html } from "@react-three/drei";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HotspotProps {
  position: [number, number, number];
  type?: string;
  label: string;
  value: string;
  onSelect?: (type: string) => void;
  color?: string;
}

export default function Hotspot({
  position,
  type = "default",
  label,
  value,
  onSelect,
  color = "#ff3b3b",
}: HotspotProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // 🔥 Animación pulsante
  useFrame(({ clock }) => {
    if (ref.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.2;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onClick={() => onSelect && onSelect(type)}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
        setHovered(false);
      }}
    >
      <sphereGeometry args={[0.08, 16, 16]} />

      <meshStandardMaterial
        color={hovered ? "#ffffff" : color}
        emissive={hovered ? "#ffffff" : color}
        emissiveIntensity={hovered ? 5 : 2}
      />

      {/* 🔥 Tooltip */}
      {hovered && (
        <Html distanceFactor={10} position={[0.15, 0, 0]}>
          <div className="bg-gray-900/90 border border-blue-500/50 p-2 rounded-lg whitespace-nowrap shadow-xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              {label}
            </p>
            <p className="text-white font-black text-xs">{value}</p>
          </div>
        </Html>
      )}
    </mesh>
  );
}

 