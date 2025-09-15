import { CAMERA_GRID } from '../constants/cameraLayout'
import * as THREE from 'three'

/**
 * Mathematical camera-relative face calculation system
 * Replaces manual mappings with vector-based calculations
 */

type WorldAxis = 'x' | 'y' | 'z'
type WorldLayer = -1 | 0 | 1

interface CameraVectors {
  forward: THREE.Vector3
  right: THREE.Vector3
  up: THREE.Vector3
}

/**
 * Calculate camera's orientation vectors from position and target
 */
function getCameraVectors(cameraId: string): CameraVectors {
  const camera = CAMERA_GRID[cameraId]
  if (!camera) {
    throw new Error(`Camera ${cameraId} not found`)
  }
  
  const position = new THREE.Vector3(...camera.position)
  const target = new THREE.Vector3(...camera.target)
  const worldUp = new THREE.Vector3(0, 1, 0)
  
  // Calculate camera's local coordinate system
  const forward = new THREE.Vector3().subVectors(target, position).normalize()
  const right = new THREE.Vector3().crossVectors(forward, worldUp).normalize()
  const up = new THREE.Vector3().crossVectors(right, forward).normalize()
  
  return { forward, right, up }
}

/**
 * Convert a direction vector to world axis and layer
 */
function vectorToWorldAxis(vector: THREE.Vector3): { axis: WorldAxis; layer: WorldLayer } {
  // Get absolute values manually
  const absX = Math.abs(vector.x)
  const absY = Math.abs(vector.y)
  const absZ = Math.abs(vector.z)
  
  // Find the dominant axis
  let axis: WorldAxis
  if (absX > absY && absX > absZ) {
    axis = 'x'
  } else if (absY > absX && absY > absZ) {
    axis = 'y'
  } else {
    axis = 'z'
  }
  
  // Determine layer based on direction
  const component = vector[axis]
  const layer: WorldLayer = component > 0.5 ? 1 : component < -0.5 ? -1 : 0
  
  return { axis, layer }
}

/**
 * Get world axis and layer for a camera-relative direction
 */
function getCameraRelativeAxis(cameraId: string, direction: 'front' | 'back' | 'left' | 'right' | 'up' | 'down'): { axis: WorldAxis; layer: WorldLayer } {
  const vectors = getCameraVectors(cameraId)
  
  let directionVector: THREE.Vector3
  
  switch (direction) {
    case 'front':
      // Front = towards the cube (negative forward since camera looks at cube)
      directionVector = new THREE.Vector3().copy(vectors.forward).negate()
      break
    case 'back':
      // Back = away from cube (positive forward)
      directionVector = new THREE.Vector3().copy(vectors.forward)
      break
    case 'right':
      // Right = camera's right direction
      directionVector = new THREE.Vector3().copy(vectors.right)
      break
    case 'left':
      // Left = opposite of camera's right
      directionVector = new THREE.Vector3().copy(vectors.right).negate()
      break
    case 'up':
      // Up = always world up
      directionVector = new THREE.Vector3(0, 1, 0)
      break
    case 'down':
      // Down = always world down
      directionVector = new THREE.Vector3(0, -1, 0)
      break
    default:
      throw new Error(`Invalid direction: ${direction}`)
  }
  
  return vectorToWorldAxis(directionVector)
}

/**
 * Convert axis and layer to face notation
 */
function axisToFaceNotation(axis: WorldAxis, layer: WorldLayer): string {
  switch (axis) {
    case 'x':
      return layer === 1 ? 'R' : layer === -1 ? 'L' : 'M'
    case 'y':
      return layer === 1 ? 'U' : layer === -1 ? 'D' : 'E'
    case 'z':
      return layer === 1 ? 'F' : layer === -1 ? 'B' : 'S'
  }
}

/**
 * Camera grouping system - cameras that should share the same mapping
 */
function getCameraGroup(cameraId: string): string {
  // Define which cameras should share mappings based on your original grouping
  const cameraGroups: Record<string, string> = {
    // Group 1: Upper front-right / Upper front
    'upper-0': 'group-1',  // front-right (기준면)
    'upper-7': 'group-1',  // front
    
    // Group 2: Upper right / Upper back-right  
    'upper-1': 'group-2',  // right
    'upper-2': 'group-2',  // back-right (기준면)
    
    // Group 3: Upper back / Upper back-left
    'upper-3': 'group-3',  // back
    'upper-4': 'group-3',  // back-left (기준면)
    
    // Group 4: Upper left / Upper front-left
    'upper-5': 'group-4',  // left
    'upper-6': 'group-4',  // front-left (기준면)
    
    // Group 5: Lower back / Lower back-left
    'lower-3': 'group-5',  // back
    'lower-4': 'group-5',  // back-left (기준면)
    
    // Group 6: Lower left / Lower front-left
    'lower-5': 'group-6',  // left
    'lower-6': 'group-6',  // front-left (기준면)
    
    // Group 7: Lower front / Lower front-right
    'lower-7': 'group-7',  // front
    'lower-0': 'group-7',  // front-right (기준면)
    
    // Group 8: Lower right / Lower back-right
    'lower-1': 'group-8',  // right
    'lower-2': 'group-8',  // back-right (기준면)
  }
  
  return cameraGroups[cameraId] || `individual-${cameraId}`
}

/**
 * Get the reference camera for each group (the "기준면")
 */
function getGroupReferenceCamera(group: string): string {
  const groupReferences: Record<string, string> = {
    'group-1': 'upper-0',  // front-right (기준면)
    'group-2': 'upper-2',  // back-right (기준면)
    'group-3': 'upper-4',  // back-left (기준면)
    'group-4': 'upper-6',  // front-left (기준면)
    'group-5': 'lower-4',  // back-left (기준면)
    'group-6': 'lower-6',  // front-left (기준면)
    'group-7': 'lower-0',  // front-right (기준면)
    'group-8': 'lower-2',  // back-right (기준면)
  }
  
  return groupReferences[group] || group.replace('individual-', '')
}

/**
 * Mathematical camera-relative mapping generator with grouping support
 * Cameras in the same group share the same mapping based on their reference camera
 */
export function getCameraRelativeMapping(cameraId: string): Record<string, string> {
  try {
    // Special handling for Top/Bottom overhead views
    if (cameraId === 'top' || cameraId.startsWith('top-') || 
        cameraId === 'bottom' || cameraId.startsWith('bottom-')) {
      return getTopBottomMapping(cameraId)
    }
    
    // Get the group and use the reference camera for calculation
    const group = getCameraGroup(cameraId)
    const referenceCamera = getGroupReferenceCamera(group)
    
    console.log(`DEBUG: Camera ${cameraId} → Group ${group} → Reference ${referenceCamera}`)
    
    // Calculate mapping based on the reference camera
    const frontAxis = getCameraRelativeAxis(referenceCamera, 'front')
    const backAxis = getCameraRelativeAxis(referenceCamera, 'back')
    const leftAxis = getCameraRelativeAxis(referenceCamera, 'left')
    const rightAxis = getCameraRelativeAxis(referenceCamera, 'right')
    const upAxis = getCameraRelativeAxis(referenceCamera, 'up')
    const downAxis = getCameraRelativeAxis(referenceCamera, 'down')
    
    let mapping = {
      'q': axisToFaceNotation(frontAxis.axis, frontAxis.layer),
      'e': axisToFaceNotation(backAxis.axis, backAxis.layer),
      'a': axisToFaceNotation(leftAxis.axis, leftAxis.layer),
      'd': axisToFaceNotation(rightAxis.axis, rightAxis.layer),
      'w': axisToFaceNotation(upAxis.axis, upAxis.layer),
      's': axisToFaceNotation(downAxis.axis, downAxis.layer)
    }
    
    console.log(`DEBUG: Base mapping for ${referenceCamera}:`, mapping)
    
    // Apply corrections based on observed patterns
    if (cameraId.startsWith('lower-')) {
      // All lower cameras have W/S reversed
      const temp = mapping.w
      mapping.w = mapping.s
      mapping.s = temp
      
      // Apply specific group corrections
      if (group === 'group-5') { // Lower back/back-left: A/D reversed
        const temp2 = mapping.a
        mapping.a = mapping.d
        mapping.d = temp2
      } else if (group === 'group-6') { // Lower left/front-left: Q/E reversed
        const temp2 = mapping.q
        mapping.q = mapping.e
        mapping.e = temp2
      } else if (group === 'group-7') { // Lower front/front-right: A/D reversed
        const temp2 = mapping.a
        mapping.a = mapping.d
        mapping.d = temp2
      } else if (group === 'group-8') { // Lower right/back-right: Q/E reversed
        const temp2 = mapping.q
        mapping.q = mapping.e
        mapping.e = temp2
      }
    }
    
    console.log(`DEBUG: Final mapping for ${cameraId}:`, mapping)
    
    return mapping
  } catch (error) {
    console.error(`Failed to calculate camera-relative mapping for ${cameraId}:`, error)
    // Fallback to default mapping
    return {
      'q': 'F', 'w': 'U', 'e': 'B',
      'a': 'L', 's': 'D', 'd': 'R'
    }
  }
}

/**
 * Special mapping for Top/Bottom overhead views
 * Corrected to match visual directions when looking from above/below
 */
function getTopBottomMapping(cameraId: string): Record<string, string> {
  // Get rotation index (0, 1, 2, 3) from camera ID
  let rotationIndex = 0
  if (cameraId.includes('-')) {
    rotationIndex = parseInt(cameraId.split('-')[1]) || 0
  }
  
  const isBottom = cameraId.startsWith('bottom')
  
  // Top View: Looking down from above
  // Testing: Q → U (Up face), E → D (Down face)
  // W/S control the visually up/down faces 
  const baseMappings = [
    // 0 degrees - front facing
    { 'w': 'B', 's': 'F', 'q': 'U', 'e': 'D', 'a': 'L', 'd': 'R' },
    // 90 degrees - right facing  
    { 'w': 'L', 's': 'R', 'q': 'U', 'e': 'D', 'a': 'F', 'd': 'B' },
    // 180 degrees - back facing
    { 'w': 'F', 's': 'B', 'q': 'U', 'e': 'D', 'a': 'R', 'd': 'L' },
    // 270 degrees - left facing
    { 'w': 'R', 's': 'L', 'q': 'U', 'e': 'D', 'a': 'B', 'd': 'F' }
  ]
  
  let mapping = { ...baseMappings[rotationIndex] }
  
  // For bottom view, some directions are flipped
  if (isBottom) {
    // Swap Q and E (left/right visual directions)
    const tempQE = mapping.q
    mapping.q = mapping.e
    mapping.e = tempQE
    
    // Swap W and S (up/down visual directions)
    const tempWS = mapping.w
    mapping.w = mapping.s
    mapping.s = tempWS
    
    // Remove A/D swap for Bottom View - keep them same as Top View
    // (A/D swap was causing incorrect mapping)
  }
  
  console.log(`DEBUG: Top/Bottom mapping for ${cameraId} (rotation ${rotationIndex}):`, mapping)
  
  return mapping
}

/**
 * Get camera-relative X-axis rotation mapping (vertical flip)
 */
export function getCameraRelativeXRotation(cameraId: string): string {
  try {
    // Special handling for Top/Bottom overhead views
    if (cameraId === 'top' || cameraId.startsWith('top-') || 
        cameraId === 'bottom' || cameraId.startsWith('bottom-')) {
      return 'X' // Default X rotation for top/bottom views
    }
    
    // For corner cameras, map to the appropriate X-axis rotation based on camera groups
    const group = getCameraGroup(cameraId)

    // Camera group to vertical flip mapping (camera-relative)
    // Flip towards camera (Z-axis rotation towards viewer) - reversed direction
    const xRotationMap: Record<string, string> = {
      'group-1': "Z'",  // front-right/front cameras - flip towards camera
      'group-2': 'X',   // right/back-right cameras - flip towards camera  
      'group-3': 'Z',   // back/back-left cameras - flip towards camera
      'group-4': "X'",  // left/front-left cameras - flip towards camera
      'group-5': 'Z',   // lower back/back-left cameras - flip towards camera
      'group-6': "X'",  // lower left/front-left cameras - flip towards camera
      'group-7': "Z'",  // lower front/front-right cameras - flip towards camera
      'group-8': 'X',   // lower right/back-right cameras - flip towards camera
    }
    
    return xRotationMap[group] || 'X'
    
  } catch (error) {
    console.error(`Failed to get X-rotation mapping for ${cameraId}:`, error)
    return 'X' // Default fallback
  }
}

/**
 * Debug function to validate camera-relative calculations
 */
export function debugCameraMapping(cameraId: string): void {
  console.log(`\n=== Camera ${cameraId} Analysis ===`)
  
  const camera = CAMERA_GRID[cameraId]
  if (!camera) {
    console.error(`Camera ${cameraId} not found`)
    return
  }
  
  console.log(`Position: [${camera.position.join(', ')}]`)
  console.log(`Target: [${camera.target.join(', ')}]`)
  
  // Show grouping information
  const group = getCameraGroup(cameraId)
  const referenceCamera = getGroupReferenceCamera(group)
  console.log(`Group: ${group}`)
  console.log(`Reference Camera: ${referenceCamera}`)
  if (referenceCamera !== cameraId) {
    console.log(`⚠️  This camera uses mapping from ${referenceCamera}`)
  }
  
  try {
    const vectors = getCameraVectors(referenceCamera)
    console.log(`Reference Camera Vectors:`)
    console.log(`  Forward: [${vectors.forward.x.toFixed(2)}, ${vectors.forward.y.toFixed(2)}, ${vectors.forward.z.toFixed(2)}]`)
    console.log(`  Right: [${vectors.right.x.toFixed(2)}, ${vectors.right.y.toFixed(2)}, ${vectors.right.z.toFixed(2)}]`)
    console.log(`  Up: [${vectors.up.x.toFixed(2)}, ${vectors.up.y.toFixed(2)}, ${vectors.up.z.toFixed(2)}]`)
  } catch (error) {
    console.error('Failed to get camera vectors:', error)
    return
  }
  
  const mapping = getCameraRelativeMapping(cameraId)
  console.log('Key Mapping:', mapping)
  
  console.log('Expected Behavior:')
  console.log(`  Q (Front): ${mapping.q} face`)
  console.log(`  E (Back): ${mapping.e} face`)
  console.log(`  A (Left): ${mapping.a} face`)
  console.log(`  D (Right): ${mapping.d} face`)
  console.log(`  W (Up): ${mapping.w} face`)
  console.log(`  S (Down): ${mapping.s} face`)
}