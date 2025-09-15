import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { CAMERA_GRID } from '../constants/cameraLayout'
import { ANIMATION_CONFIG } from '../constants'

interface CameraControllerProps {
  currentCamera: string
  zoomLevel?: number
  animationSpeed?: number
}

/**
 * 16-camera grid system - fixed positions only
 */
export function CameraController({ currentCamera, zoomLevel = 1, animationSpeed = 1 }: CameraControllerProps) {
  const { camera } = useThree()
  const isAnimatingRef = useRef(false)
  const lastCameraRef = useRef<string>(currentCamera)
  const lastZoomRef = useRef<number>(zoomLevel)
  
  // Function to smoothly transition camera to a specific position
  const setCameraPosition = (cameraId: string) => {
    if (isAnimatingRef.current) return
    
    const cameraInfo = CAMERA_GRID[cameraId]
    if (!cameraInfo) return
    
    isAnimatingRef.current = true
    
    // Store current camera state
    const startPosition = camera.position.clone()
    const endPosition = new THREE.Vector3(...cameraInfo.position)
    const target = new THREE.Vector3(...cameraInfo.target)
    
    // Apply zoom to end position
    const zoomedEndPosition = endPosition.clone().multiplyScalar(1 / zoomLevel)
    
    // Animate camera position with animation speed sync
    gsap.to({}, {
      duration: animationSpeed * 0.8, // Scale camera speed with animation speed
      ease: ANIMATION_CONFIG.EASING,
      onUpdate: function() {
        const progress = this.progress()
        
        // Interpolate camera position
        camera.position.lerpVectors(startPosition, zoomedEndPosition, progress)
        
        // Always look at the target (cube center)
        camera.lookAt(target)
      },
      onComplete: () => {
        // Ensure final position is exact
        camera.position.copy(zoomedEndPosition)
        camera.lookAt(target)
        
        isAnimatingRef.current = false
      }
    })
  }
  
  // Update camera when currentCamera changes
  useEffect(() => {
    if (currentCamera !== lastCameraRef.current) {
      setCameraPosition(currentCamera)
      lastCameraRef.current = currentCamera
    }
  }, [currentCamera])
  
  // Update camera when zoom changes
  useEffect(() => {
    if (zoomLevel !== lastZoomRef.current) {
      setCameraPosition(currentCamera) // Re-apply current position with new zoom
      lastZoomRef.current = zoomLevel
    }
  }, [zoomLevel, currentCamera])
  
  // Initialize camera position
  useEffect(() => {
    const cameraInfo = CAMERA_GRID[currentCamera]
    if (cameraInfo) {
      const position = new THREE.Vector3(...cameraInfo.position)
      position.multiplyScalar(1 / zoomLevel)
      camera.position.copy(position)
      camera.lookAt(...cameraInfo.target)
    }
  }, [])
  
  return null // No controls to render
}