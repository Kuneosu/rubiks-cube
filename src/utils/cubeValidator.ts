import * as THREE from 'three'
import { isPositionEqual } from './constants'

/**
 * Finds cube at specific position with tolerance
 */
function findCubeAtPosition(cubes: THREE.Mesh[], x: number, y: number, z: number): THREE.Mesh | undefined {
  return cubes.find(cube => {
    const position = cube.position
    return isPositionEqual(position.x, x) &&
           isPositionEqual(position.y, y) &&
           isPositionEqual(position.z, z)
  })
}

/**
 * Check if the Rubik's cube is in solved state
 * @param cubes Array of cube meshes from the scene
 * @returns true if cube is solved, false otherwise
 */
export function isCubeSolved(cubes: THREE.Mesh[]): boolean {
  if (!cubes || cubes.length !== 27) return false

  try {

    // Get the center cubes for each face (these determine the face color)
    const centerPositions = {
      right: { x: 1, y: 0, z: 0 },   // Right face center
      left: { x: -1, y: 0, z: 0 },   // Left face center  
      top: { x: 0, y: 1, z: 0 },     // Top face center
      bottom: { x: 0, y: -1, z: 0 }, // Bottom face center
      front: { x: 0, y: 0, z: 1 },   // Front face center
      back: { x: 0, y: 0, z: -1 }    // Back face center
    }

    // Find center cubes and get their colors
    const centerColors: Record<string, number> = {}
    
    for (const [face, pos] of Object.entries(centerPositions)) {
      const centerCube = findCubeAtPosition(cubes, pos.x, pos.y, pos.z)
      
      if (!centerCube) return false
      
      // Get the face color from the cube's material
      const faceColor = getFaceColor(centerCube, face as 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back')
      if (faceColor === null) return false
      
      centerColors[face] = faceColor
    }

    // Check all cubes on each face to see if they match the center color
    for (const [face, expectedColor] of Object.entries(centerColors)) {
      
      // Get all cubes on this face
      const faceCubes = getFaceCubes(cubes, face as 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back')
      
      // Check if all cubes on this face have the same color
      for (const cube of faceCubes) {
        const cubeColor = getFaceColor(cube, face as 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back')
        if (cubeColor !== expectedColor) {
          return false
        }
      }
    }

    return true

  } catch (error) {
    console.error('Error checking cube solved state:', error)
    return false
  }
}

/**
 * Get all cubes that belong to a specific face
 */
function getFaceCubes(cubes: THREE.Mesh[], face: 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back'): THREE.Mesh[] {
  const positions = {
    right: (cube: THREE.Mesh) => cube.position.x > 0.5,
    left: (cube: THREE.Mesh) => cube.position.x < -0.5,
    top: (cube: THREE.Mesh) => cube.position.y > 0.5,
    bottom: (cube: THREE.Mesh) => cube.position.y < -0.5,
    front: (cube: THREE.Mesh) => cube.position.z > 0.5,
    back: (cube: THREE.Mesh) => cube.position.z < -0.5
  }
  
  return cubes.filter(positions[face])
}

/**
 * Get the color of a specific face of a cube
 */
function getFaceColor(cube: THREE.Mesh, face: 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back'): number | null {
  try {
    if (!cube.material || !Array.isArray(cube.material)) return null
    
    const materials = cube.material as THREE.MeshLambertMaterial[]
    
    // Map face names to material indices (this depends on cube geometry setup)
    const faceIndices = {
      right: 0,   // +X
      left: 1,    // -X
      top: 2,     // +Y
      bottom: 3,  // -Y
      front: 4,   // +Z
      back: 5     // -Z
    }
    
    const materialIndex = faceIndices[face]
    if (materialIndex >= materials.length) return null
    
    const material = materials[materialIndex]
    if (!material || !material.color) return null
    
    return material.color.getHex()
    
  } catch (error) {
    console.error('Error getting face color:', error)
    return null
  }
}

/**
 * Simple solved state check using the cubes array from the scene
 */
export function isSimpleCubeSolved(cubes?: THREE.Mesh[]): boolean {
  console.log('🎯 Starting simple color-based cube validation');

  if (!cubes || cubes.length !== 27) {
    console.log('❌ Invalid cubes:', cubes?.length);
    return false;
  }

  // Define the 6 faces to check
  const facesToCheck = [
    { name: 'Right', axis: 'x', coord: 1 },
    { name: 'Left', axis: 'x', coord: -1 },
    { name: 'Up', axis: 'y', coord: 1 },
    { name: 'Down', axis: 'y', coord: -1 },
    { name: 'Front', axis: 'z', coord: 1 },
    { name: 'Back', axis: 'z', coord: -1 }
  ];

  // Track face colors to ensure uniformity
  const faceColors: Record<string, number> = {};

  for (const face of facesToCheck) {
    console.log(`\n🔍 Checking ${face.name} face (${face.axis}=${face.coord}):`);

    // Get cubes on this face
    const faceCubes = cubes.filter(cube => {
      const pos = cube.position;
      const coord = face.axis === 'x' ? pos.x : face.axis === 'y' ? pos.y : pos.z;
      return isPositionEqual(coord, face.coord);
    });

    console.log(`Found ${faceCubes.length} cubes on ${face.name} face`);

    if (faceCubes.length !== 9) {
      console.log(`❌ Expected 9 cubes on ${face.name} face, found ${faceCubes.length}`);
      return false;
    }

    // Check if all cubes on this face have the same color
    const faceColorCounts: Record<string, number> = {};

    for (const cube of faceCubes) {
      // Get the color of the face that's currently pointing in the target direction
      const faceColor = getCubeColorForDirection(cube, face.axis as 'x' | 'y' | 'z', face.coord > 0);

      if (faceColor !== null) {
        const colorString = faceColor.toString(16).padStart(6, '0');
        faceColorCounts[colorString] = (faceColorCounts[colorString] || 0) + 1;

        const pos = cube.position;
        console.log(`Cube at (${pos.x}, ${pos.y}, ${pos.z}): face color=${colorString}`);
      } else {
        console.log(`⚠️ Could not determine face color for cube at ${cube.position.x}, ${cube.position.y}, ${cube.position.z}`);
        return false;
      }
    }

    // Check if all cubes have the same color
    const uniqueColors = Object.keys(faceColorCounts);
    if (uniqueColors.length !== 1) {
      console.log(`❌ ${face.name} face has multiple colors:`, faceColorCounts);
      return false;
    }

    const faceColor = parseInt(uniqueColors[0], 16);
    console.log(`✅ ${face.name} face is uniform with color: #${uniqueColors[0]}`);

    // Store this face's color for cross-face validation
    faceColors[face.name] = faceColor;
  }

  // Validate that all faces have different colors (no two faces same color)
  const colorValues = Object.values(faceColors);
  const uniqueColorValues = new Set(colorValues);

  if (uniqueColorValues.size !== 6) {
    console.log(`❌ Found duplicate colors across faces:`, faceColors);
    return false;
  }

  console.log('✅ All faces are uniform and have unique colors');
  console.log('🎯 Face colors:', faceColors);
  return true;
}

/**
 * Get the color of the cube face that's currently pointing in a specific world direction
 * This accounts for cube rotations by checking which material corresponds to the target direction
 */
function getCubeColorForDirection(cube: THREE.Mesh, axis: 'x' | 'y' | 'z', positive: boolean): number | null {
  if (!Array.isArray(cube.material)) {
    return null;
  }

  // The target normal vector in world space
  const targetNormal = new THREE.Vector3();
  if (axis === 'x') {
    targetNormal.set(positive ? 1 : -1, 0, 0);
  } else if (axis === 'y') {
    targetNormal.set(0, positive ? 1 : -1, 0);
  } else {
    targetNormal.set(0, 0, positive ? 1 : -1);
  }

  // Standard cube face normals in local space (before any rotation)
  const faceNormals = [
    new THREE.Vector3(1, 0, 0),   // Right face (material index 0)
    new THREE.Vector3(-1, 0, 0),  // Left face (material index 1)
    new THREE.Vector3(0, 1, 0),   // Top face (material index 2)
    new THREE.Vector3(0, -1, 0),  // Bottom face (material index 3)
    new THREE.Vector3(0, 0, 1),   // Front face (material index 4)
    new THREE.Vector3(0, 0, -1)   // Back face (material index 5)
  ];

  // Transform the normals by the cube's current rotation
  let closestMaterialIndex = 0;
  let closestDot = -2; // Start with impossible value

  for (let i = 0; i < faceNormals.length; i++) {
    // Transform the face normal by the cube's rotation
    const transformedNormal = faceNormals[i].clone();
    transformedNormal.applyQuaternion(cube.quaternion);

    // Check how closely this transformed normal matches our target direction
    const dot = transformedNormal.dot(targetNormal);

    if (dot > closestDot) {
      closestDot = dot;
      closestMaterialIndex = i;
    }
  }

  // Get the color from the material that best matches our target direction
  const material = cube.material[closestMaterialIndex] as THREE.MeshPhysicalMaterial;
  return material.color.getHex();
}

/**
 * Automated test that performs shuffle and solve operations
 */
export function runAutomatedTest(cubes: THREE.Mesh[], shuffle: () => void, reset?: () => void): {
  success: boolean;
  details: string;
} {
  console.log('🧪 === AUTOMATED TEST START ===');

  if (!cubes || cubes.length !== 27) {
    console.log('❌ TEST_FAIL: Invalid cube array');
    return { success: false, details: "INVALID_CUBES" };
  }

  try {
    // 1. Initial state check
    console.log('📋 STEP_1: Checking initial state');
    const initialState = analyzeCubeState(cubes);
    console.log(`✅ INITIAL_STATE: solved=${initialState.solved} uniformFaces=${initialState.uniformFaces}/6`);

    // 2. Shuffle test
    console.log('📋 STEP_2: Shuffling cube');
    shuffle();

    // Wait a moment for animations to complete
    setTimeout(() => {
      const afterShuffle = analyzeCubeState(cubes);
      console.log(`✅ AFTER_SHUFFLE: solved=${afterShuffle.solved} uniformFaces=${afterShuffle.uniformFaces}/6`);

      if (afterShuffle.solved) {
        console.log('❌ TEST_FAIL: Cube still solved after shuffle');
        return { success: false, details: "SHUFFLE_FAILED" };
      }

      // 3. Reset/Solve test
      console.log('📋 STEP_3: Resetting cube to solved state');
      if (reset) {
        reset();

        setTimeout(() => {
          const afterReset = analyzeCubeState(cubes);
          console.log(`✅ AFTER_RESET: solved=${afterReset.solved} uniformFaces=${afterReset.uniformFaces}/6`);

          if (!afterReset.solved) {
            console.log('❌ TEST_FAIL: Cube not solved after reset');
            console.log('🧪 === AUTOMATED TEST END ===');
            return { success: false, details: "RESET_FAILED" };
          }

          console.log('🎉 TEST_SUCCESS: All operations completed successfully');
          console.log('🧪 === AUTOMATED TEST END ===');
          return { success: true, details: "ALL_TESTS_PASS" };
        }, 1000);
      }
    }, 1000);

    return { success: true, details: "TEST_RUNNING" };

  } catch (error) {
    console.log(`❌ TEST_ERROR: ${(error as Error).message}`);
    console.log('🧪 === AUTOMATED TEST END ===');
    return { success: false, details: `ERROR: ${(error as Error).message}` };
  }
}


/**
 * Compact cube analysis for AI processing
 */
export function analyzeCubeState(cubes?: THREE.Mesh[]): {
  solved: boolean;
  uniformFaces: number;
  details: string;
} {
  if (!cubes || cubes.length !== 27) {
    return { solved: false, uniformFaces: 0, details: "INVALID_CUBES" };
  }

  const allCubesInitial = cubes.every(cube => {
    const r = cube.rotation;
    return Math.abs(r.x) < 0.01 && Math.abs(r.y) < 0.01 && Math.abs(r.z) < 0.01;
  });

  if (allCubesInitial) {
    return { solved: true, uniformFaces: 6, details: "INITIAL_STATE" };
  }

  const xCoords = [...new Set(cubes.map(c => Math.round(c.position.x * 10) / 10))].sort((a, b) => a - b);
  const yCoords = [...new Set(cubes.map(c => Math.round(c.position.y * 10) / 10))].sort((a, b) => a - b);
  const zCoords = [...new Set(cubes.map(c => Math.round(c.position.z * 10) / 10))].sort((a, b) => a - b);

  const faces = [
    { coord: Math.max(...xCoords), axis: 'x' },
    { coord: Math.min(...xCoords), axis: 'x' },
    { coord: Math.max(...yCoords), axis: 'y' },
    { coord: Math.min(...yCoords), axis: 'y' },
    { coord: Math.max(...zCoords), axis: 'z' },
    { coord: Math.min(...zCoords), axis: 'z' }
  ];

  let uniformFaces = 0;

  for (const face of faces) {
    const faceCubes = cubes.filter(cube => {
      const pos = cube.position;
      return face.axis === 'x' ? isPositionEqual(pos.x, face.coord) :
             face.axis === 'y' ? isPositionEqual(pos.y, face.coord) :
             isPositionEqual(pos.z, face.coord);
    });

    if (faceCubes.length !== 9) continue;

    const faceColors = faceCubes.map(cube => {
      const materials = Array.isArray(cube.material) ? cube.material : [cube.material];
      for (const mat of materials) {
        const color = (mat as THREE.MeshPhysicalMaterial)?.color?.getHex();
        if (color && color !== 0x1a1a1a) return color;
      }
      return 0x1a1a1a;
    });

    const firstColor = faceColors[0];
    if (faceColors.every(c => c === firstColor) && firstColor !== 0x1a1a1a) {
      uniformFaces++;
    }
  }

  const solved = uniformFaces === 6;
  return {
    solved,
    uniformFaces,
    details: solved ? "SOLVED" : `PARTIAL_${uniformFaces}/6`
  };
}