import React from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CubeGroup } from "./CubeGroup";
import { CubeColors } from "../constants/colorPresets";
import { Lighting } from "./Lighting";
import { CameraController } from "./CameraController";

interface SceneProps {
  cubesRef: React.MutableRefObject<THREE.Mesh[]>;
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  currentCamera: string;
  cubeState: string;
  zoomLevel?: number;
  animationSpeed?: number;
  colors?: CubeColors;
}

/**
 * Main 3D scene component using React Three Fiber
 */
export function Scene({ cubesRef, sceneRef, currentCamera, cubeState, zoomLevel = 1, animationSpeed = 1, colors }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{
        position: [6, 6, 6],
        fov: 45,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
      }}
      dpr={window.devicePixelRatio}
      onCreated={({ scene, gl }) => {
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x2c2c2c);
        // Remove fog to prevent blurriness when zoomed out
        // scene.fog = new THREE.Fog(0x2c2c2c, 10, 25);

        // Enable shadows
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
      }}
      style={{ width: "100vw", height: "100vh", touchAction: "none" }}
      onPointerMissed={() => null}
    >
      {/* Lighting setup */}
      <Lighting currentCamera={currentCamera} />

      {/* Camera controls */}
      <CameraController currentCamera={currentCamera} zoomLevel={zoomLevel} animationSpeed={animationSpeed} />

      {/* Cube group */}
      <CubeGroup cubesRef={cubesRef} currentCamera={currentCamera} cubeState={cubeState} colors={colors} />

      {/* Ground plane for shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

    </Canvas>
  );
}
