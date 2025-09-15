import { FaceRotation, CameraPosition } from '../types'

// Cube colors based on standard Rubik's cube
export const CUBE_COLORS = {
  RIGHT: 0xC41E3A,   // Red
  LEFT: 0xFF5800,    // Orange
  TOP: 0xFFFFFF,     // White
  BOTTOM: 0xFFD500,  // Yellow
  FRONT: 0x009E60,   // Green
  BACK: 0x0051BA,    // Blue
  INTERNAL: 0x1a1a1a // Dark gray for internal faces
} as const

// Physical cube parameters
export const CUBE_CONFIG = {
  SIZE: 0.98,
  GAP: 0.02,
  RADIUS: 0.08,
  get SPACING() { return this.SIZE + this.GAP }
} as const

// Fixed face rotations (world coordinates) - corrected for proper face mapping
export const FACE_ROTATIONS: Record<string, FaceRotation> = {
  'R': { axis: 'x', layer: 1, angle: Math.PI / 2 },     // Right face clockwise
  "R'": { axis: 'x', layer: 1, angle: -Math.PI / 2 },   // Right face counterclockwise
  'L': { axis: 'x', layer: -1, angle: -Math.PI / 2 },   // Left face clockwise
  "L'": { axis: 'x', layer: -1, angle: Math.PI / 2 },   // Left face counterclockwise
  'U': { axis: 'y', layer: 1, angle: -Math.PI / 2 },    // Up face clockwise
  "U'": { axis: 'y', layer: 1, angle: Math.PI / 2 },    // Up face counterclockwise
  'D': { axis: 'y', layer: -1, angle: Math.PI / 2 },    // Down face clockwise
  "D'": { axis: 'y', layer: -1, angle: -Math.PI / 2 },  // Down face counterclockwise
  'F': { axis: 'z', layer: 1, angle: Math.PI / 2 },     // Front face clockwise
  "F'": { axis: 'z', layer: 1, angle: -Math.PI / 2 },   // Front face counterclockwise
  'B': { axis: 'z', layer: -1, angle: -Math.PI / 2 },   // Back face clockwise
  "B'": { axis: 'z', layer: -1, angle: Math.PI / 2 },   // Back face counterclockwise
  'M': { axis: 'x', layer: 0, angle: -Math.PI / 2 },    // Middle X
  'E': { axis: 'y', layer: 0, angle: Math.PI / 2 },     // Equator Y
  'S': { axis: 'z', layer: 0, angle: Math.PI / 2 },     // Standing Z
  // Whole cube rotations for Top/Bottom views
  'Y': { axis: 'y', layer: 'all', angle: Math.PI / 2 },    // Whole cube Y clockwise
  'X': { axis: 'x', layer: 'all', angle: Math.PI / 2 },    // Whole cube X clockwise
  'Z': { axis: 'z', layer: 'all', angle: Math.PI / 2 },    // Whole cube Z clockwise
  // Counterclockwise rotations
  "Y'": { axis: 'y', layer: 'all', angle: -Math.PI / 2 },   // Whole cube Y counterclockwise
  "X'": { axis: 'x', layer: 'all', angle: -Math.PI / 2 },   // Whole cube X counterclockwise
  "Z'": { axis: 'z', layer: 'all', angle: -Math.PI / 2 },   // Whole cube Z counterclockwise
}

// Fixed camera positions - cube centered approach with more viewing angles
export const CAMERA_POSITIONS: Record<string, CameraPosition> = {
  front: { position: [0, 0, 9], target: [0, 0, 0] },
  back: { position: [0, 0, -9], target: [0, 0, 0] },
  right: { position: [9, 0, 0], target: [0, 0, 0] },
  left: { position: [-9, 0, 0], target: [0, 0, 0] },
  top: { position: [0, 9, 0], target: [0, 0, 0] },
  bottom: { position: [0, -9, 0], target: [0, 0, 0] },
  isometric: { position: [7, 7, 7], target: [0, 0, 0] },
  // Additional diagonal views for better cube observation
  'front-top': { position: [0, 6, 6], target: [0, 0, 0] },
  'front-bottom': { position: [0, -6, 6], target: [0, 0, 0] },
  'back-top': { position: [0, 6, -6], target: [0, 0, 0] },
  'back-bottom': { position: [0, -6, -6], target: [0, 0, 0] },
  'right-top': { position: [6, 6, 0], target: [0, 0, 0] },
  'right-bottom': { position: [6, -6, 0], target: [0, 0, 0] },
  'left-top': { position: [-6, 6, 0], target: [0, 0, 0] },
  'left-bottom': { position: [-6, -6, 0], target: [0, 0, 0] }
}

// Simple key mappings - always consistent regardless of camera
export const KEY_MAPPINGS = {
  'w': 'U',  // Always Up face
  's': 'D',  // Always Down face
  'a': 'L',  // Always Left face
  'd': 'R',  // Always Right face
  'q': 'F',  // Always Front face (current view when front-facing)
  'e': 'B'   // Always Back face
} as const

// Animation defaults
export const ANIMATION_CONFIG = {
  ROTATION_DURATION: 0.4,
  CAMERA_DURATION: 0.8,
  SHUFFLE_DURATION: 0.1,
  EASING: 'power2.inOut'
} as const

// UI Configuration
export const UI_CONFIG = {
  CONTROLS_PANEL: {
    position: { top: '20px', left: '20px' },
    background: 'rgba(0,0,0,0.85)',
    borderRadius: '12px',
    padding: '20px'
  }
} as const