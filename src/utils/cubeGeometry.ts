import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { CUBE_CONFIG, CUBE_COLORS } from '../constants'

/**
 * Creates the geometry for a single cube piece
 */
export function createCubeGeometry(): RoundedBoxGeometry {
  return new RoundedBoxGeometry(
    CUBE_CONFIG.SIZE,
    CUBE_CONFIG.SIZE,
    CUBE_CONFIG.SIZE,
    4, // segments
    CUBE_CONFIG.RADIUS
  )
}

/**
 * Creates materials for each face of a cube based on its position
 * Only external faces get colored, internal faces are dark
 */
export function createCubeMaterials(x: number, y: number, z: number): THREE.MeshPhysicalMaterial[] {
  const createMaterial = (color: number) => {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: 0.3,
      metalness: 0.1,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      reflectivity: 0.6,
      envMapIntensity: 0.4
    })
  }

  return [
    createMaterial(x === 1 ? CUBE_COLORS.RIGHT : CUBE_COLORS.INTERNAL),   // Right face
    createMaterial(x === -1 ? CUBE_COLORS.LEFT : CUBE_COLORS.INTERNAL),   // Left face
    createMaterial(y === 1 ? CUBE_COLORS.TOP : CUBE_COLORS.INTERNAL),     // Top face
    createMaterial(y === -1 ? CUBE_COLORS.BOTTOM : CUBE_COLORS.INTERNAL), // Bottom face
    createMaterial(z === 1 ? CUBE_COLORS.FRONT : CUBE_COLORS.INTERNAL),   // Front face
    createMaterial(z === -1 ? CUBE_COLORS.BACK : CUBE_COLORS.INTERNAL)    // Back face
  ]
}

/**
 * Creates edge geometry for a cube piece to show the grid lines
 */
export function createCubeEdges(geometry: THREE.BufferGeometry): THREE.LineSegments {
  const edges = new THREE.EdgesGeometry(geometry, 30)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1,
    transparent: true,
    opacity: 0.4
  })
  return new THREE.LineSegments(edges, lineMaterial)
}

/**
 * Creates a single cube piece with proper materials and position
 */
export function createCubePiece(x: number, y: number, z: number): THREE.Mesh {
  const geometry = createCubeGeometry()
  const materials = createCubeMaterials(x, y, z)
  const cube = new THREE.Mesh(geometry, materials)
  
  // Set world position
  cube.position.set(
    x * CUBE_CONFIG.SPACING,
    y * CUBE_CONFIG.SPACING,
    z * CUBE_CONFIG.SPACING
  )
  
  // Enable shadows
  cube.castShadow = true
  cube.receiveShadow = true
  
  // Store initial grid position for easy reset
  cube.userData = {
    initialX: x,
    initialY: y,
    initialZ: z,
    x, y, z
  }
  
  // Add edge lines
  const edges = createCubeEdges(geometry)
  cube.add(edges)
  
  return cube
}

/**
 * Highlights a layer of cubes with an emissive glow
 */
export function highlightCubes(cubes: THREE.Mesh[], highlight: boolean = true): void {
  const emissiveColor = highlight ? new THREE.Color(0xffff00) : new THREE.Color(0x000000)
  const emissiveIntensity = highlight ? 0.3 : 0
  
  cubes.forEach(cube => {
    if (Array.isArray(cube.material)) {
      cube.material.forEach(mat => {
        if (mat instanceof THREE.MeshPhysicalMaterial) {
          mat.emissive = emissiveColor
          mat.emissiveIntensity = emissiveIntensity
        }
      })
    }
  })
}

/**
 * Creates a wireframe outline for the reference face
 */
export function createFaceOutline(axis: 'x' | 'y' | 'z', layer: number): THREE.LineSegments {
  let geometry: THREE.BoxGeometry
  const position = new THREE.Vector3()
  const size = CUBE_CONFIG.SPACING * 3
  
  switch (axis) {
    case 'x':
      geometry = new THREE.BoxGeometry(0.05, size, size)
      position.set(layer * CUBE_CONFIG.SPACING, 0, 0)
      break
    case 'y':
      geometry = new THREE.BoxGeometry(size, 0.05, size)
      position.set(0, layer * CUBE_CONFIG.SPACING, 0)
      break
    case 'z':
      geometry = new THREE.BoxGeometry(size, size, 0.05)
      position.set(0, 0, layer * CUBE_CONFIG.SPACING)
      break
  }
  
  const edges = new THREE.EdgesGeometry(geometry)
  const material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    linewidth: 3
  })
  
  const outline = new THREE.LineSegments(edges, material)
  outline.position.copy(position)
  outline.name = 'face-outline'
  
  return outline
}