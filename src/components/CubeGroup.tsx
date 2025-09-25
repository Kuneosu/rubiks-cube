import React, { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createCubePiece } from '../utils/cubeGeometry'
import { CubeColors } from '../constants/colorPresets'
import { CAMERA_GRID } from '../constants/cameraLayout'
import { gsap } from 'gsap'

interface CubeGroupProps {
  cubesRef: React.MutableRefObject<THREE.Mesh[]>
  currentCamera: string
  cubeState: string
  colors?: CubeColors
}

/**
 * Component that creates and manages the 3x3x3 cube group
 */
export function CubeGroup({ cubesRef, currentCamera, cubeState, colors }: CubeGroupProps) {
  const { scene } = useThree()
  const cubeGroupRef = useRef<THREE.Group>()
  const lastCameraLevelRef = useRef<'upper' | 'lower' | 'top' | 'bottom'>()
  
  useEffect(() => {
    // Create a group to hold all cubes
    const cubeGroup = new THREE.Group()
    cubeGroupRef.current = cubeGroup
    scene.add(cubeGroup)
    
    // Clear any existing cubes
    if (cubesRef.current && Array.isArray(cubesRef.current)) {
      cubesRef.current.forEach(cube => {
        cubeGroup.remove(cube)
        cube.geometry.dispose()
        if (Array.isArray(cube.material)) {
          cube.material.forEach(mat => mat.dispose())
        }
      })
    }
    cubesRef.current = []
    
    // Create 27 cube pieces (3x3x3)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cube = createCubePiece(x, y, z, colors)
          cubeGroup.add(cube)
          cubesRef.current.push(cube)
        }
      }
    }

    console.log(`Created ${cubesRef.current.length} cube pieces`)
    
    // Cleanup function
    return () => {
      if (cubesRef.current && Array.isArray(cubesRef.current)) {
        cubesRef.current.forEach(cube => {
          cubeGroup.remove(cube)
          cube.geometry.dispose()
          if (Array.isArray(cube.material)) {
            cube.material.forEach(mat => mat.dispose())
          }
        })
      }
      cubesRef.current = []
      scene.remove(cubeGroup)
    }
  }, [scene, cubesRef])
  
  // Handle cube rotation when camera level changes
  useEffect(() => {
    const cameraInfo = CAMERA_GRID[currentCamera]
    if (!cameraInfo || !cubeGroupRef.current) return
    
    // Don't flip cube if it's currently animating (rotating or shuffling)
    if (cubeState !== 'idle') return
    
    const currentLevel = cameraInfo.level
    
    // Only animate if level actually changed
    if (currentLevel !== lastCameraLevelRef.current) {
      const targetRotation = (currentLevel === 'lower' || currentLevel === 'bottom') ? Math.PI : 0 // 180 degrees for lower/bottom
      
      gsap.to(cubeGroupRef.current.rotation, {
        duration: 0.5,
        x: targetRotation,
        ease: 'power2.inOut'
      })
      
      lastCameraLevelRef.current = currentLevel
    }
  }, [currentCamera, cubeState])
  

  return null // This component doesn't render anything itself
}