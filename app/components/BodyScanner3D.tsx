"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

export interface MuscleActivationMap {
  chest: number;     // 0.0 (inactivo) a 1.0 (máxima activación)
  back: number;
  shoulders: number;
  arms: number;
  core: number;
  legs: number;
}

interface BodyScannerProps {
  records: any[];
  onSelectPart: (part: string | null) => void;
  muscleActivation?: MuscleActivationMap;
  focusedMuscle?: string | null;
}

/* =========================
   🧬 MODELO ANATÓMICO 3D CON SHADER MUSCULAR POR ZONAS
========================= */
function AnatomicalMuscleBody({
  muscleActivation,
  focusedMuscle,
  onSelectPart,
}: {
  muscleActivation: MuscleActivationMap;
  focusedMuscle?: string | null;
  onSelectPart: (part: string | null) => void;
}) {
  const { scene } = useGLTF("/models/human.glb");
  const groupRef = useRef<THREE.Group>(null!);

  // Shader anatómico que colorea directamente los grupos musculares sobre la malla 3D
  const muscleShaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uChest: { value: 0 },
          uBack: { value: 0 },
          uShoulders: { value: 0 },
          uArms: { value: 0 },
          uCore: { value: 0 },
          uLegs: { value: 0 },
        },
        vertexShader: `
          varying vec3 vLocalPos;
          varying vec3 vNormalView;
          varying vec3 vViewPosition;

          void main() {
            vLocalPos = position;
            vNormalView = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vLocalPos;
          varying vec3 vNormalView;
          varying vec3 vViewPosition;

          uniform float uTime;
          uniform float uChest;
          uniform float uBack;
          uniform float uShoulders;
          uniform float uArms;
          uniform float uCore;
          uniform float uLegs;

          // Máscara suave de intervalo [a, b] con borde feather
          float band(float v, float a, float b, float feather) {
            return smoothstep(a - feather, a + feather, v) * (1.0 - smoothstep(b - feather, b + feather, v));
          }

          // Color térmico según nivel de activación (0..1)
          vec3 activationPalette(float intensity) {
            // De Ámbar/Naranja energético (activación media) a Rojo/Carmesí incandescente (alta activación)
            vec3 lowColor  = vec3(0.98, 0.55, 0.12); // Naranja #fa8c1f
            vec3 midColor  = vec3(0.96, 0.28, 0.15); // Rojo-Naranja #f54726
            vec3 highColor = vec3(1.00, 0.14, 0.28); // Carmesí Neón #ff2447
            vec3 c = mix(lowColor, midColor, smoothstep(0.2, 0.65, intensity));
            return mix(c, highColor, smoothstep(0.65, 1.0, intensity));
          }

          void main() {
            float x = vLocalPos.x;
            float ax = abs(x);
            float y = vLocalPos.y; // y > 0: Anterior (Pecho/Abdomen) | y < 0: Posterior (Espalda/Glúteo)
            float z = vLocalPos.z; // Altura en cm: 0 (pies) .. 182 (cabeza)

            // 1. PECHO (Pectorales mayor y menor: anterior, z 123..143, |x| < 16.5)
            float chestMask = band(z, 123.0, 143.0, 3.0)
                            * band(ax, 0.8, 16.2, 2.2)
                            * smoothstep(0.5, 4.0, y);

            // 2. CORE / ABDOMEN Y OBLICUOS (anterior, z 94..122.5, |x| < 14.8)
            float coreMask = band(z, 94.0, 122.5, 3.0)
                           * smoothstep(15.0, 11.5, ax)
                           * smoothstep(0.0, 3.5, y);

            // 3. ESPALDA (Dorsales, trapecio, romboides y lumbar: posterior, z 102..149, |x| < 18.2)
            float backMask = band(z, 102.0, 149.0, 3.5)
                           * smoothstep(18.5, 14.5, ax)
                           * smoothstep(0.5, -3.0, y);

            // 4. HOMBROS (Deltoides anterior, lateral y posterior: z 132..149.5, |x| 14.2..26.5)
            float shoulderMask = band(z, 132.5, 149.5, 2.8)
                               * band(ax, 14.2, 26.5, 2.2);

            // 5. BRAZOS (Bíceps, tríceps y antebrazos: z 84..133.5, |x| > 17.2)
            float armsMask = band(z, 84.0, 133.5, 3.0)
                           * smoothstep(16.8, 19.5, ax);

            // 6. PIERNAS Y GLÚTEOS (Cuádriceps, femorales, glúteos y pantorrillas: z 8..93.5, |x| < 24)
            float legsMask = band(z, 8.0, 93.5, 3.5)
                           * smoothstep(24.5, 20.0, ax);

            // Iluminación anatómica 3D (Rim Fresnel + Difusa suave para definir el relieve muscular)
            vec3 N = normalize(vNormalView);
            vec3 V = normalize(vViewPosition);
            float ndotv = clamp(dot(N, V), 0.0, 1.0);
            float fresnel = pow(1.0 - ndotv, 2.2);
            float keyLight = clamp(dot(N, normalize(vec3(0.4, 0.6, 0.8))), 0.0, 1.0);

            // Color base del cuerpo en reposo (Azul Ciber-Anatómico oscuro y elegante, no chillón)
            vec3 baseBodyColor = vec3(0.08, 0.14, 0.24) + vec3(0.06, 0.22, 0.38) * keyLight + vec3(0.10, 0.45, 0.72) * fresnel * 0.75;

            // Pulso sutil de energía en los músculos trabajados hoy
            float pulse = 0.92 + 0.08 * sin(uTime * 3.2 - z * 0.08);

            // Combinar la activación de cada grupo muscular
            float aChest     = clamp(chestMask * uChest, 0.0, 1.0);
            float aBack      = clamp(backMask * uBack, 0.0, 1.0);
            float aShoulders = clamp(shoulderMask * uShoulders, 0.0, 1.0);
            float aArms      = clamp(armsMask * uArms, 0.0, 1.0);
            float aCore      = clamp(coreMask * uCore, 0.0, 1.0);
            float aLegs      = clamp(legsMask * uLegs, 0.0, 1.0);

            float maxActivation = max(max(max(aChest, aBack), max(aShoulders, aArms)), max(aCore, aLegs));

            // Color muscular activo con relieve 3D
            vec3 muscleGlow = activationPalette(maxActivation) * pulse;
            // Añadir núcleo brillante y borde energético al músculo activo
            muscleGlow += vec3(1.0, 0.65, 0.3) * fresnel * maxActivation * 0.55;
            muscleGlow *= (0.75 + 0.45 * keyLight);

            // Línea de escaneo biométrico sutil
            float scanLine = smoothstep(0.96, 1.0, sin(z * 0.18 - uTime * 2.2)) * 0.08;

            vec3 finalColor = mix(baseBodyColor, muscleGlow, smoothstep(0.05, 0.35, maxActivation));
            finalColor += vec3(0.2, 0.6, 1.0) * scanLine;

            float alpha = mix(0.82, 0.96, smoothstep(0.05, 0.4, maxActivation));
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: true,
      }),
    []
  );

  // Material secundario muy sutil para ocultar el ruido interno (shorts/esqueleto secundario)
  const GhostInnerMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#0f172a"),
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Object_3 (34,584 vértices) es la piel/musculatura completa del cuerpo humano
        const vertexCount = mesh.geometry?.attributes?.position?.count || 0;
        if (vertexCount > 10000) {
          mesh.material = muscleShaderMaterial;
        } else {
          mesh.material = GhostInnerMaterial;
        }
      }
    });
  }, [scene, muscleShaderMaterial, GhostInnerMaterial]);

  // Actualizar uniformes cuando cambia la rutina/músculos trabajados
  useEffect(() => {
    muscleShaderMaterial.uniforms.uChest.value = muscleActivation.chest;
    muscleShaderMaterial.uniforms.uBack.value = muscleActivation.back;
    muscleShaderMaterial.uniforms.uShoulders.value = muscleActivation.shoulders;
    muscleShaderMaterial.uniforms.uArms.value = muscleActivation.arms;
    muscleShaderMaterial.uniforms.uCore.value = muscleActivation.core;
    muscleShaderMaterial.uniforms.uLegs.value = muscleActivation.legs;
  }, [muscleActivation, muscleShaderMaterial]);

  useFrame((state, delta) => {
    muscleShaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime();

    if (!groupRef.current) return;

    // Si el usuario seleccionó un músculo específico en la barra inferior, orientar suavemente el cuerpo hacia esa zona
    if (focusedMuscle) {
      let targetAngle = 0; // Frente (Pecho, Core, Piernas)
      if (focusedMuscle === "espalda") targetAngle = Math.PI; // Espalda (180°)
      else if (focusedMuscle === "hombros" || focusedMuscle === "brazos") targetAngle = -Math.PI * 0.35; // Perfil 3/4

      const current = groupRef.current.rotation.y;
      const diff = Math.atan2(Math.sin(targetAngle - current), Math.cos(targetAngle - current));
      groupRef.current.rotation.y += diff * Math.min(1, delta * 5);
    } else {
      // Rotación continua suave para apreciar frente y espalda
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  // Permitir tocar directamente el cuerpo 3D para consultar el músculo en esa altura/cara
  const handleMeshClick = (e: any) => {
    e.stopPropagation();
    const localPoint = e.point;
    if (!localPoint) return;

    if (localPoint.y < -0.1) {
      onSelectPart("piernas");
    } else if (Math.abs(localPoint.x) > 0.22) {
      onSelectPart("brazos");
    } else if (localPoint.y > 0.38 && Math.abs(localPoint.x) > 0.14) {
      onSelectPart("hombros");
    } else if (localPoint.y > 0.25) {
      onSelectPart(muscleActivation.back > muscleActivation.chest ? "espalda" : "chest");
    } else {
      onSelectPart("waist");
    }
  };

  return (
    <group ref={groupRef} onClick={handleMeshClick}>
      <Center>
        <primitive object={scene} scale={1.22} />
      </Center>
    </group>
  );
}

const DEFAULT_ACTIVATION: MuscleActivationMap = {
  chest: 0,
  back: 0,
  shoulders: 0,
  arms: 0,
  core: 0,
  legs: 0,
};

export default function BodyScanner3D({
  onSelectPart,
  muscleActivation = DEFAULT_ACTIVATION,
  focusedMuscle = null,
}: BodyScannerProps) {
  return (
    <div className="w-full h-full min-h-[300px] relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0.2, 3.8], fov: 42 }} dpr={[1, 1.75]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.5} />

        <AnatomicalMuscleBody
          muscleActivation={muscleActivation}
          focusedMuscle={focusedMuscle}
          onSelectPart={onSelectPart}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          minPolarAngle={Math.PI / 2.3}
          maxPolarAngle={Math.PI / 1.85}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/human.glb");
