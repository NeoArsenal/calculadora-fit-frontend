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

  // Shader anatómico calibrado con las coordenadas reales de human.glb:
  // En la malla local de human.glb, la matriz raíz transforma local.y -> -world.z:
  // Por lo tanto:
  //   y < 0  => CARA ANTERIOR (Frente: Pecho, Abdomen, Cuádriceps, Bíceps)
  //   y > 0  => CARA POSTERIOR (Dorso: Espalda, Trapecio, Glúteos, Isquiotibiales)
  //   z      => ALTURA en cm (0 = planta de los pies, 182 = coronilla)
  //   x      => IZQUIERDA / DERECHA en cm (0 = eje central)
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
            vec3 lowColor  = vec3(0.98, 0.55, 0.12); // Naranja energético
            vec3 midColor  = vec3(0.96, 0.28, 0.15); // Rojo-Naranja
            vec3 highColor = vec3(1.00, 0.14, 0.28); // Carmesí Neón
            vec3 c = mix(lowColor, midColor, smoothstep(0.2, 0.65, intensity));
            return mix(c, highColor, smoothstep(0.65, 1.0, intensity));
          }

          void main() {
            float x = vLocalPos.x;
            float ax = abs(x);
            float y = vLocalPos.y; // y < 0 = FRENTE (Pecho/Abdomen) | y > 0 = ESPALDA
            float z = vLocalPos.z; // Altura en cm: 0 (pies) .. 182 (cabeza)

            // 1. PECHO (Pectorales en la cara ANTERIOR: y < -1.0, z 124..143, |x| 1.0..15.5)
            float chestMask = band(z, 124.0, 143.0, 2.8)
                            * band(ax, 0.8, 15.5, 2.0)
                            * smoothstep(0.0, -3.5, y);

            // 2. CORE / ABDOMEN Y OBLICUOS (Cara ANTERIOR: y < -1.0, z 95..123, |x| < 13.5)
            float coreMask = band(z, 95.0, 123.0, 2.8)
                           * smoothstep(14.0, 10.5, ax)
                           * smoothstep(0.0, -3.2, y);

            // 3. ESPALDA (Dorsales, trapecio y romboides en la cara POSTERIOR: y > +1.0, z 104..149, |x| 0.8..17.5)
            float backMask = band(z, 104.0, 149.0, 3.2)
                           * band(ax, 0.8, 17.5, 2.2)
                           * smoothstep(0.0, 3.5, y);

            // 4. HOMBROS (Deltoides anterior, lateral y posterior: z 133.5..148.5, |x| 15.0..25.5)
            float shoulderMask = band(z, 133.5, 148.5, 2.5)
                               * band(ax, 15.0, 25.5, 2.0);

            // 5. BRAZOS (Bíceps, tríceps y antebrazos sin tocar cadera ni dedos: z 98..133.5, |x| > 19.5)
            float armsMask = band(z, 98.0, 133.5, 2.8)
                           * smoothstep(18.8, 21.2, ax);

            // 6. PIERNAS Y GLÚTEOS (Cuádriceps, isquios, glúteos y pantorrillas sin pies ni manos: z 12..92, |x| < 21)
            float legsMask = band(z, 12.0, 92.0, 3.2)
                           * smoothstep(22.0, 18.5, ax);

            // Iluminación anatómica 3D (Rim Fresnel + Difusa suave para definir el relieve muscular)
            vec3 N = normalize(vNormalView);
            vec3 V = normalize(vViewPosition);
            float ndotv = clamp(dot(N, V), 0.0, 1.0);
            float fresnel = pow(1.0 - ndotv, 2.2);
            float keyLight = clamp(dot(N, normalize(vec3(0.4, 0.6, 0.8))), 0.0, 1.0);

            // Color base del cuerpo en reposo
            vec3 baseBodyColor = vec3(0.08, 0.14, 0.24) + vec3(0.06, 0.22, 0.38) * keyLight + vec3(0.10, 0.45, 0.72) * fresnel * 0.75;

            // Pulso sutil de energía en los músculos trabajados
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
            muscleGlow += vec3(1.0, 0.65, 0.3) * fresnel * maxActivation * 0.55;
            muscleGlow *= (0.75 + 0.45 * keyLight);

            // Línea de escaneo biométrico sutil
            float scanLine = smoothstep(0.96, 1.0, sin(z * 0.18 - uTime * 2.2)) * 0.08;

            vec3 finalColor = mix(baseBodyColor, muscleGlow, smoothstep(0.05, 0.35, maxActivation));
            finalColor += vec3(0.2, 0.6, 1.0) * scanLine;

            float alpha = mix(0.84, 0.97, smoothstep(0.05, 0.4, maxActivation));
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: true,
      }),
    []
  );

  // Material secundario invisible para evitar manchas de las mallas secundarias (shorts/esqueleto interno)
  const GhostInnerMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#0f172a"),
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const vertexCount = mesh.geometry?.attributes?.position?.count || 0;
        if (vertexCount > 10000) {
          mesh.material = muscleShaderMaterial;
        } else {
          mesh.material = GhostInnerMaterial;
          mesh.visible = false;
        }
      }
    });
  }, [scene, muscleShaderMaterial, GhostInnerMaterial]);

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

    if (focusedMuscle) {
      // Orientar suavemente el cuerpo hacia la cara del músculo seleccionado:
      // 0 rad = Frente (Pecho, Abdomen/Core, Cuádriceps)
      // PI rad = Espalda (Dorsales, Trapecio)
      // -0.45 rad = Perfil 3/4 (Hombros, Brazos)
      let targetAngle = 0;
      if (focusedMuscle === "espalda") targetAngle = Math.PI;
      else if (focusedMuscle === "hombros" || focusedMuscle === "brazos") targetAngle = -0.55;

      const current = groupRef.current.rotation.y;
      const diff = Math.atan2(Math.sin(targetAngle - current), Math.cos(targetAngle - current));
      groupRef.current.rotation.y += diff * Math.min(1, delta * 5.5);
    } else {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
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
