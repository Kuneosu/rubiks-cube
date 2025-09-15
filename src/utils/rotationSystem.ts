import * as THREE from 'three'
import { gsap } from 'gsap'
import { FACE_ROTATIONS, CUBE_CONFIG } from '../constants'
import { FaceNotation } from '../types'
import { highlightCubes } from './cubeGeometry'
import { LAYER_TOLERANCE } from './constants'

/**
 * Gets all cubes in a specific layer based on axis and layer value
 * If layer is 'all', returns all cubes
 */
export function getCubesInLayer(cubes: THREE.Mesh[], axis: 'x' | 'y' | 'z', layer: number | 'all'): THREE.Mesh[] {
  // Return all cubes for whole cube rotations
  if (layer === 'all') {
    return [...cubes]
  }
  
  const tolerance = LAYER_TOLERANCE // Tolerance for layer detection
  
  return cubes.filter(cube => {
    const pos = cube.position
    switch (axis) {
      case 'x': return Math.abs(pos.x - layer * CUBE_CONFIG.SPACING) < tolerance
      case 'y': return Math.abs(pos.y - layer * CUBE_CONFIG.SPACING) < tolerance
      case 'z': return Math.abs(pos.z - layer * CUBE_CONFIG.SPACING) < tolerance
      default: return false
    }
  })
}

/**
 * Rotates a layer of the cube with smooth animation
 */
export function rotateLayer(
  scene: THREE.Scene,
  cubes: THREE.Mesh[],
  notation: string,
  duration: number = 0.4,
  showHighlight: boolean = true
): Promise<void> {
  return new Promise((resolve) => {
    // Parse notation
    const isPrime = notation.includes("'")
    const baseNotation = notation.replace("'", "").toUpperCase() as FaceNotation
    
    const rotation = FACE_ROTATIONS[baseNotation]
    if (!rotation) {
      resolve()
      return
    }
    
    const { axis, layer, angle } = rotation
    const layerCubes = getCubesInLayer(cubes, axis, layer)
    
    if (layerCubes.length === 0) {
      resolve()
      return
    }
    
    // Show highlight before rotation
    if (showHighlight) {
      highlightCubes(layerCubes, true)
    }
    
    // Find the main cube group (parent of the cubes)
    const mainCubeGroup = layerCubes[0]?.parent
    
    // Create temporary group for rotation
    const group = new THREE.Group()
    scene.add(group)
    
    // Attach cubes to group (preserves world position)
    layerCubes.forEach(cube => {
      group.attach(cube)
    })
    
    // Calculate final angle (reverse if prime notation)
    const finalAngle = isPrime ? -angle : angle
    
    // Animate rotation
    const rotationProperty: Record<string, number> = {}
    rotationProperty[axis] = finalAngle
    
    gsap.to(group.rotation, {
      ...rotationProperty,
      duration: duration,
      ease: 'power2.inOut',
      onComplete: () => {
        // Clear highlight
        if (showHighlight) {
          highlightCubes(layerCubes, false)
        }
        
        // Detach cubes from group back to main cube group (not scene)
        layerCubes.forEach(cube => {
          if (mainCubeGroup) {
            mainCubeGroup.attach(cube)
          } else {
            scene.attach(cube)
          }
          
          // Round positions to avoid floating point errors
          cube.position.x = Math.round(cube.position.x * 100) / 100
          cube.position.y = Math.round(cube.position.y * 100) / 100
          cube.position.z = Math.round(cube.position.z * 100) / 100
        })
        
        // Remove temporary group
        scene.remove(group)

        // Face IDs are no longer needed - color detection handles cube state

        resolve()
      }
    })
  })
}

/**
 * Shuffles the cube with random moves
 */
export async function shuffleCube(
  scene: THREE.Scene,
  cubes: THREE.Mesh[],
  moves: number = 25
): Promise<string[]> {
  // Use only basic face rotations for shuffle (avoid M, E, S, X, Y, Z)
  const notations = ['R', 'L', 'U', 'D', 'F', 'B']
  const modifiers = ['', "'"]
  const shuffleMoves: string[] = []
  
  for (let i = 0; i < moves; i++) {
    const randomNotation = notations[Math.floor(Math.random() * notations.length)]
    const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    const move = randomNotation + randomModifier
    
    shuffleMoves.push(move)
    await rotateLayer(scene, cubes, move, 0.08, false) // Fast, no highlight
  }
  
  return shuffleMoves
}

/**
 * Resets cube to solved state
 */
export function resetCube(cubes: THREE.Mesh[]): void {
  cubes.forEach(cube => {
    const userData = cube.userData
    if (userData) {
      // Reset to initial grid position
      cube.position.set(
        userData.initialX * CUBE_CONFIG.SPACING,
        userData.initialY * CUBE_CONFIG.SPACING,
        userData.initialZ * CUBE_CONFIG.SPACING
      )
      cube.rotation.set(0, 0, 0)

      // Face IDs no longer needed - color detection handles solved state

      // Ensure matrix is updated
      cube.updateMatrix()
      cube.matrixWorldNeedsUpdate = true
    }
  })
}

/**
 * Gets the inverse of a move for undo functionality
 */
export function getInverseMove(move: string): string {
  return move.includes("'") ? move.replace("'", "") : move + "'"
}