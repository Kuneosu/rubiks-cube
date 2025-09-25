import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { CUBE_CONFIG, CUBE_COLORS } from '../constants'
import { CubeColors } from '../constants/colorPresets'

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
export function createCubeMaterials(x: number, y: number, z: number, colors: CubeColors = CUBE_COLORS): THREE.MeshPhysicalMaterial[] {
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
    createMaterial(x === 1 ? colors.RIGHT : colors.INTERNAL),   // Right face
    createMaterial(x === -1 ? colors.LEFT : colors.INTERNAL),   // Left face
    createMaterial(y === 1 ? colors.TOP : colors.INTERNAL),     // Top face
    createMaterial(y === -1 ? colors.BOTTOM : colors.INTERNAL), // Bottom face
    createMaterial(z === 1 ? colors.FRONT : colors.INTERNAL),   // Front face
    createMaterial(z === -1 ? colors.BACK : colors.INTERNAL)    // Back face
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
export function createCubePiece(x: number, y: number, z: number, colors?: CubeColors): THREE.Mesh {
  const geometry = createCubeGeometry()
  const materials = createCubeMaterials(x, y, z, colors)
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
 * Updates the colors of existing cubes
 */
export function updateCubeColors(cubes: THREE.Mesh[], colors: CubeColors): void {
  cubes.forEach(cube => {
    const { x, y, z } = cube.userData
    if (Array.isArray(cube.material)) {
      // Face order: Right, Left, Top, Bottom, Front, Back
      const newColors = [
        x === 1 ? colors.RIGHT : colors.INTERNAL,   // Right face
        x === -1 ? colors.LEFT : colors.INTERNAL,   // Left face
        y === 1 ? colors.TOP : colors.INTERNAL,     // Top face
        y === -1 ? colors.BOTTOM : colors.INTERNAL, // Bottom face
        z === 1 ? colors.FRONT : colors.INTERNAL,   // Front face
        z === -1 ? colors.BACK : colors.INTERNAL    // Back face
      ]

      cube.material.forEach((mat, index) => {
        if (mat instanceof THREE.MeshPhysicalMaterial) {
          mat.color.setHex(newColors[index])
        }
      })
    }
  })
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