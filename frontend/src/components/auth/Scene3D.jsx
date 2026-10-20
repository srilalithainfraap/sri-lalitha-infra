/**
 * Scene3D — Cinematic 3D authentication intro
 *
 * A fully procedural scene (no external GLB/GLTF assets required):
 * - Low-poly stylized male character walks in from the side carrying a suitcase
 * - Character bends down and places the suitcase
 * - Suitcase lid opens with warm golden light emerging from the interior
 * - `onFormReady` fires so the parent shows the functional auth form
 *
 * Exported as default so LoginPage / RegisterPage can React.lazy() it,
 * keeping Three.js out of the main bundle.
 */

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ── Timing constants (seconds) ────────────────────────────────────────────
const WALK_END  = 3.2;   // character arrives at destination
const BEND_END  = 4.5;   // suitcase placed on floor
const OPEN_END  = 6.4;   // lid fully open, golden glow at peak
const CHAR_END_X = 0.62; // character stops here (right of suitcase)
const SC_X = 0.05;       // suitcase final x
const SC_Z = 0.45;       // suitcase final z (slightly forward)

// ── Math helpers ──────────────────────────────────────────────────────────
const lerp   = (a, b, t) => a + (b - a) * t;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const easeOut3  = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOut = (t) => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4*c*c*c : 1 - Math.pow(-2*c+2, 3)/2;
};

// ── Materials (created once, shared) ─────────────────────────────────────
const mkStd = (color, roughness = 0.75, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const MATS = {
  skin:       mkStd('#FDDCB5', 0.78),
  hair:       mkStd('#2A1800', 0.88),
  shirt:      mkStd('#E8EEF8', 0.70),
  pants:      mkStd('#1A2744', 0.80),
  shoe:       mkStd('#1A0A00', 0.72),
  suitcase:   mkStd('#7A4E2C', 0.48, 0.10),
  goldMetal:  mkStd('#D4AF37', 0.18, 0.85),
  floorMat:   mkStd('#090F1C', 0.22, 0.55),
  wallMat:    mkStd('#080D1A', 0.95),
};
const interiorMat = new THREE.MeshStandardMaterial({
  color: '#D4AF37',
  emissive: new THREE.Color('#FFD78B'),
  emissiveIntensity: 0,
  roughness: 0.6,
});

// ── Camera ────────────────────────────────────────────────────────────────
function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(-0.3, 2.2, 7.2);
    camera.lookAt(0, 0.9, 0);
    if (camera.fov !== 45) { camera.fov = 45; camera.updateProjectionMatrix(); }
  }, [camera]);

  useFrame((_, delta) => {
    // Subtle slow camera drift
    const t = Date.now() * 0.00012;
    camera.position.x = Math.sin(t) * 0.18;
    camera.lookAt(0, 0.9, 0.1);
  });
  return null;
}

// ── The scene geometry + animation ───────────────────────────────────────
function SceneContent({ onFormReady, skipRef }) {
  // Character refs
  const charRef     = useRef();  // root group — position animated
  const torsoRef    = useRef();  // pivot for bending
  const leftLegRef  = useRef();  // pivot at hip
  const rightLegRef = useRef();
  const leftArmRef  = useRef();  // pivot at shoulder
  const rightArmRef = useRef();

  // Suitcase refs
  const scRef           = useRef(); // suitcase root group
  const lidHingeRef     = useRef(); // lid pivot group
  const interiorRef     = useRef(); // emissive interior mesh
  const innerLightRef   = useRef(); // point light inside suitcase
  const floorLightRef   = useRef(); // extra floor glow

  // Animation state
  const elapsed       = useRef(0);
  const formCalled    = useRef(false);
  const snapPos       = useRef(new THREE.Vector3()); // suitcase pos snapshot at bend start
  const snapped       = useRef(false);

  useFrame((_, delta) => {
    if (!charRef.current || !scRef.current) return;

    // Skip jumps elapsed ahead
    if (skipRef?.current && elapsed.current < OPEN_END) {
      elapsed.current = OPEN_END + 0.01;
    }

    elapsed.current += delta;
    const t = elapsed.current;

    // ── WALKING (0 → WALK_END) ───────────────────────────────────
    if (t <= WALK_END) {
      const p   = easeOut3(t / WALK_END);
      const spd = 5.5;
      const cyc = Math.sin(t * spd);

      charRef.current.position.x = lerp(5.2, CHAR_END_X, p);
      charRef.current.position.y = Math.abs(Math.sin(t * spd * 2)) * 0.022;

      leftLegRef.current.rotation.x  =  cyc * 0.43;
      rightLegRef.current.rotation.x = -cyc * 0.43;
      leftArmRef.current.rotation.x  = -cyc * 0.26;
      rightArmRef.current.rotation.x =  cyc * 0.26;

      // Suitcase tracks right hand (approx world pos)
      scRef.current.position.x = charRef.current.position.x + 0.26;
      scRef.current.position.y = 0.96 - Math.abs(cyc) * 0.04;
      scRef.current.position.z = -rightArmRef.current.rotation.x * 0.30;
      scRef.current.rotation.z = -rightArmRef.current.rotation.x * 0.18;

      snapped.current = false;
    }

    // ── BENDING / PLACING (WALK_END → BEND_END) ──────────────────
    if (t > WALK_END && t <= BEND_END) {
      const p = easeInOut((t - WALK_END) / (BEND_END - WALK_END));

      // Snapshot suitcase position once at bend start
      if (!snapped.current) {
        snapPos.current.copy(scRef.current.position);
        snapped.current = true;
      }

      // Decelerate limbs to rest
      leftLegRef.current.rotation.x  = lerp(leftLegRef.current.rotation.x,  0, 0.12);
      rightLegRef.current.rotation.x = lerp(rightLegRef.current.rotation.x, 0, 0.12);
      leftArmRef.current.rotation.x  = lerp(leftArmRef.current.rotation.x,  0, 0.12);
      charRef.current.position.y     = lerp(charRef.current.position.y,     0, 0.10);

      // Torso bends forward
      torsoRef.current.rotation.x = p * 0.52;
      // Right arm reaches down
      rightArmRef.current.rotation.x = p * 0.60;

      // Suitcase goes to floor
      scRef.current.position.x = lerp(snapPos.current.x, SC_X, p);
      scRef.current.position.y = lerp(snapPos.current.y, 0.09, p);
      scRef.current.position.z = lerp(snapPos.current.z, SC_Z, p);
      scRef.current.rotation.z = lerp(scRef.current.rotation.z, 0, 0.10);
    }

    // ── OPENING (BEND_END → OPEN_END) ────────────────────────────
    if (t > BEND_END && t <= OPEN_END) {
      const p = easeInOut((t - BEND_END) / (OPEN_END - BEND_END));

      // Character returns upright and steps back a touch
      torsoRef.current.rotation.x         = lerp(0.52, 0, easeOut3(p));
      rightArmRef.current.rotation.x      = lerp(0.60, 0, easeOut3(p));
      charRef.current.position.x          = lerp(CHAR_END_X, CHAR_END_X + 0.30, easeOut3(p));

      // Lid opens: hinge rotates -1.52 rad (~87°)
      lidHingeRef.current.rotation.x = -1.52 * easeInOut(p);

      // Interior glow intensifies
      interiorRef.current.material.emissiveIntensity = lerp(0, 2.8, easeOut3(p));
      innerLightRef.current.intensity  = lerp(0, 5.0, easeOut3(p));
      floorLightRef.current.intensity  = lerp(0, 1.2, easeOut3(p));
    }

    // ── SETTLED ───────────────────────────────────────────────────
    if (t > OPEN_END) {
      if (!formCalled.current) {
        formCalled.current = true;
        onFormReady?.();
      }
      // Breathing idle
      const breath = Math.sin(t * 1.4) * 0.007;
      torsoRef.current.position.y = breath;
      // Pulse glow
      const pulse = 1 + Math.sin(t * 2.2) * 0.12;
      if (innerLightRef.current) innerLightRef.current.intensity = 5.0 * pulse;
      if (interiorRef.current)   interiorRef.current.material.emissiveIntensity = 2.8 * pulse;
    }
  });

  return (
    <>
      {/* ── Lights ────────────────────────────────────────────── */}
      <ambientLight color="#1a2a4a" intensity={0.65} />
      <directionalLight position={[-4, 6, 4]} color="#C8D8F0" intensity={1.3} castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[4, 3, -3]} color="#1A2744" intensity={0.45} />

      {/* ── Floor ─────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <primitive object={MATS.floorMat} />
      </mesh>

      {/* ── Back wall ─────────────────────────────────────────── */}
      <mesh position={[0, 4, -7]}>
        <planeGeometry args={[28, 12]} />
        <primitive object={MATS.wallMat} />
      </mesh>

      {/* ── Character ─────────────────────────────────────────── */}
      <group ref={charRef} position={[5.2, 0, 0]} castShadow>

        {/* Head */}
        <mesh position={[0, 1.70, 0]} castShadow>
          <sphereGeometry args={[0.135, 16, 12]} />
          <primitive object={MATS.skin} />
        </mesh>
        {/* Eyes */}
        {[[-0.048, 1.72, 0.128], [0.048, 1.72, 0.128]].map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.019, 7, 7]} />
            <meshBasicMaterial color="#0A0000" />
          </mesh>
        ))}
        {/* Hair */}
        <mesh position={[0, 1.80, 0]}>
          <boxGeometry args={[0.28, 0.10, 0.25]} />
          <primitive object={MATS.hair} />
        </mesh>
        <mesh position={[0, 1.77, 0.10]}>
          <boxGeometry args={[0.23, 0.06, 0.06]} />
          <primitive object={MATS.hair} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.54, 0]}>
          <cylinderGeometry args={[0.056, 0.056, 0.13, 8]} />
          <primitive object={MATS.skin} />
        </mesh>

        {/* Torso pivot (for bending) */}
        <group ref={torsoRef} position={[0, 0.84, 0]}>
          {/* Shirt body */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.34, 0.54, 0.19]} />
            <primitive object={MATS.shirt} />
          </mesh>
          {/* Shirt collar */}
          <mesh position={[0, 0.57, 0.096]}>
            <boxGeometry args={[0.11, 0.08, 0.01]} />
            <meshStandardMaterial color="#D0DCF0" roughness={0.6} />
          </mesh>
          {/* Shirt buttons */}
          {[0.10, 0.22, 0.34].map((by, i) => (
            <mesh key={i} position={[0, by, 0.097]}>
              <sphereGeometry args={[0.013, 6, 6]} />
              <meshStandardMaterial color="#B0C0D8" roughness={0.4} />
            </mesh>
          ))}

          {/* Left arm pivot (shoulder) */}
          <group ref={leftArmRef} position={[-0.23, 0.50, 0]}>
            <mesh position={[0, -0.19, 0]} castShadow>
              <boxGeometry args={[0.095, 0.38, 0.095]} />
              <primitive object={MATS.shirt} />
            </mesh>
            <mesh position={[0, -0.40, 0]}>
              <sphereGeometry args={[0.058, 8, 8]} />
              <primitive object={MATS.skin} />
            </mesh>
          </group>

          {/* Right arm pivot (shoulder, carries suitcase) */}
          <group ref={rightArmRef} position={[0.23, 0.50, 0]}>
            <mesh position={[0, -0.19, 0]} castShadow>
              <boxGeometry args={[0.095, 0.38, 0.095]} />
              <primitive object={MATS.shirt} />
            </mesh>
            <mesh position={[0, -0.40, 0]}>
              <sphereGeometry args={[0.058, 8, 8]} />
              <primitive object={MATS.skin} />
            </mesh>
          </group>
        </group>

        {/* Hip block */}
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[0.31, 0.14, 0.19]} />
          <primitive object={MATS.pants} />
        </mesh>

        {/* Left leg pivot (hip) */}
        <group ref={leftLegRef} position={[-0.105, 0.68, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <boxGeometry args={[0.12, 0.46, 0.13]} />
            <primitive object={MATS.pants} />
          </mesh>
          <mesh position={[0, -0.50, 0]}>
            <boxGeometry args={[0.11, 0.28, 0.11]} />
            <primitive object={MATS.pants} />
          </mesh>
          <mesh position={[0, -0.67, 0.045]}>
            <boxGeometry args={[0.11, 0.065, 0.18]} />
            <primitive object={MATS.shoe} />
          </mesh>
        </group>

        {/* Right leg pivot (hip) */}
        <group ref={rightLegRef} position={[0.105, 0.68, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <boxGeometry args={[0.12, 0.46, 0.13]} />
            <primitive object={MATS.pants} />
          </mesh>
          <mesh position={[0, -0.50, 0]}>
            <boxGeometry args={[0.11, 0.28, 0.11]} />
            <primitive object={MATS.pants} />
          </mesh>
          <mesh position={[0, -0.67, 0.045]}>
            <boxGeometry args={[0.11, 0.065, 0.18]} />
            <primitive object={MATS.shoe} />
          </mesh>
        </group>
      </group>

      {/* ── Suitcase (world-space, tracked to hand then placed) ── */}
      <group ref={scRef} position={[5.46, 0.96, 0]}>
        {/* Bottom body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.18, 0.23]} />
          <primitive object={MATS.suitcase} />
        </mesh>

        {/* Interior emissive panel */}
        <mesh ref={interiorRef} position={[0, 0.04, 0]}>
          <boxGeometry args={[0.48, 0.08, 0.19]} />
          <primitive object={interiorMat} />
        </mesh>

        {/* Inner golden point light */}
        <pointLight ref={innerLightRef} color="#FFD78B" intensity={0} distance={3.5} position={[0, 0.4, 0]} />
        {/* Floor bounce light */}
        <pointLight ref={floorLightRef} color="#E8A830" intensity={0} distance={2.5} position={[0, -0.1, 0]} />

        {/* Side trims */}
        {[-0.275, 0.275].map((sx, i) => (
          <mesh key={i} position={[sx, 0, 0]}>
            <boxGeometry args={[0.012, 0.20, 0.24]} />
            <primitive object={MATS.goldMetal} />
          </mesh>
        ))}

        {/* Handle bar */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.04]} />
          <primitive object={MATS.goldMetal} />
        </mesh>
        <mesh position={[-0.08, 0.08, 0]}>
          <boxGeometry args={[0.03, 0.09, 0.03]} />
          <primitive object={MATS.goldMetal} />
        </mesh>
        <mesh position={[0.08, 0.08, 0]}>
          <boxGeometry args={[0.03, 0.09, 0.03]} />
          <primitive object={MATS.goldMetal} />
        </mesh>

        {/* Clasps */}
        {[-0.16, 0.16].map((cx, i) => (
          <mesh key={i} position={[cx, 0.09, 0.12]}>
            <boxGeometry args={[0.065, 0.065, 0.012]} />
            <primitive object={MATS.goldMetal} />
          </mesh>
        ))}

        {/* Lid hinge group — pivots at top-back edge of body */}
        {/* hinge position: y = 0.09 (top of body), z = -0.115 (back face) */}
        <group ref={lidHingeRef} position={[0, 0.09, -0.115]}>
          {/* Lid mesh centered relative to hinge: offset (0, 0.09, 0.115) = closes body top */}
          <mesh position={[0, 0.09, 0.115]} castShadow>
            <boxGeometry args={[0.54, 0.18, 0.23]} />
            <primitive object={MATS.suitcase} />
          </mesh>
          {/* Lid side trims */}
          {[-0.275, 0.275].map((sx, i) => (
            <mesh key={i} position={[sx, 0.09, 0.115]}>
              <boxGeometry args={[0.012, 0.20, 0.24]} />
              <primitive object={MATS.goldMetal} />
            </mesh>
          ))}
          {/* Interior silk pattern (top face of lid interior — visible when open) */}
          <mesh position={[0, 0.00, 0.115]}>
            <boxGeometry args={[0.46, 0.01, 0.19]} />
            <meshStandardMaterial color="#8B6820" emissive="#D4AF37" emissiveIntensity={0.4} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </>
  );
}

// ── Public export — lazy-loadable ─────────────────────────────────────────
export default function Scene3D({ onFormReady, skipRef, style, className }) {
  return (
    <Canvas
      shadows
      style={style}
      className={className}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <CameraSetup />
      <SceneContent onFormReady={onFormReady} skipRef={skipRef} />
    </Canvas>
  );
}
