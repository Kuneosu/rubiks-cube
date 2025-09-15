
import { useMemo } from 'react'
import { CAMERA_GRID } from '../constants/cameraLayout'
import * as THREE from 'three'

interface LightingProps {
  currentCamera: string
}

/**
 * Enhanced lighting setup with camera-following main light
 */
export function Lighting({ currentCamera }: LightingProps) {
  // Calculate main light position based on current camera
  const lightPosition = useMemo((): THREE.Vector3 => {
    const cameraInfo = CAMERA_GRID[currentCamera]
    if (!cameraInfo) return new THREE.Vector3(10, 10, 5)

    // Position light near camera but slightly offset for better lighting
    const [x, y, z] = cameraInfo.position

    // Normalize and scale the camera position for light placement
    const lightDistance = 8
    const vector = new THREE.Vector3(x, y, z).normalize()

    // Offset the light slightly to create better shadows and highlights
    return new THREE.Vector3(
      vector.x * lightDistance + 2,
      Math.max(vector.y * lightDistance + 3, 5), // Ensure minimum height
      vector.z * lightDistance + 2
    )
  }, [currentCamera])

  // Calculate fill light position (opposite side of main light)
  const fillLightPosition = useMemo(() => {
    return new THREE.Vector3(
      -lightPosition.x * 0.3,
      lightPosition.y * 0.5,
      -lightPosition.z * 0.3
    )
  }, [lightPosition])

  return (
    <>
      {/* Camera-following main directional light */}
      <directionalLight
        position={lightPosition}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        target-position={[0, 0, 0]}
      />

      {/* Enhanced ambient light for overall illumination */}
      <ambientLight intensity={0.6} />

      {/* Dynamic fill light from opposite side */}
      <directionalLight
        position={fillLightPosition}
        intensity={0.3}
        color="#4169e1"
      />

      {/* Top rim light for edge highlighting */}
      <pointLight
        position={[0, 12, 0]}
        intensity={0.4}
        color="#ffffff"
        distance={25}
      />

      {/* Additional soft fill light */}
      <pointLight
        position={[lightPosition.x * 0.5, lightPosition.y * 0.3, lightPosition.z * 0.5]}
        intensity={0.2}
        color="#f0f8ff"
        distance={15}
      />
    </>
  )
}