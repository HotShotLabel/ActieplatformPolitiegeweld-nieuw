"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const NL_LAT = 52.1326;
const NL_LON = 5.2913;
const RADIUS = 1.62;

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function fibonacciSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    positions[i * 3 + 0] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return positions;
}

/* Deterministische ruis, zodat de scene bij elke render hetzelfde is. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function World({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pulseMaterial = useRef<THREE.PointsMaterial>(null);

  const basePositions = useMemo(() => fibonacciSphere(2600, RADIUS), []);
  const signalPositions = useMemo(() => {
    const center = latLonToVector3(NL_LAT, NL_LON, RADIUS + 0.005);
    const count = 34;
    const positions = new Float32Array(count * 3);
    const point = new THREE.Vector3();
    for (let i = 0; i < count; i += 1) {
      point.copy(center);
      point.x += (pseudoRandom(i * 3 + 1) - 0.5) * 0.34;
      point.y += (pseudoRandom(i * 3 + 2) - 0.5) * 0.26;
      point.z += (pseudoRandom(i * 3 + 3) - 0.5) * 0.34;
      point.setLength(RADIUS + 0.005);
      positions.set([point.x, point.y, point.z], i * 3);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (reduce || !group.current) return;
    const time = state.clock.elapsedTime;
    group.current.rotation.y += delta * 0.055;
    const targetX = 0.36 - state.pointer.y * 0.14;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetX,
      0.045
    );
    if (pulseMaterial.current) {
      pulseMaterial.current.size = 0.034 + Math.sin(time * 2.1) * 0.012;
    }
  });

  return (
    <group ref={group} rotation={[0.36, -0.42, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[basePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.011}
          color="#7d8794"
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[signalPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pulseMaterial}
          size={0.034}
          color="#e5484d"
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh>
        <icosahedronGeometry args={[RADIUS - 0.06, 2]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function Hero3D({ reduce = false }: { reduce?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      frameloop={reduce ? "demand" : "always"}
      style={{ position: "absolute", inset: 0 }}
    >
      <World reduce={reduce} />
    </Canvas>
  );
}
