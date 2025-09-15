import * as THREE from 'three'

// Rubik's cube face notation
export type FaceNotation = 'R' | 'L' | 'U' | 'D' | 'F' | 'B' | 'M' | 'E' | 'S' | 'X' | 'Y' | 'Z' | "X'" | "Y'" | "Z'"

// Camera view positions
export type CameraView = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom' | 'isometric' | 
  'front-top' | 'front-bottom' | 'back-top' | 'back-bottom' | 
  'right-top' | 'right-bottom' | 'left-top' | 'left-bottom'

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

// Face rotation configuration
export interface FaceRotation {
  axis: 'x' | 'y' | 'z'
  layer: number | 'all'
  angle: number
}

// Camera position configuration
export interface CameraPosition {
  position: [number, number, number]
  target: [number, number, number]
}

// Cube piece data
export interface CubePiece {
  gridPosition: [number, number, number]
  worldPosition: THREE.Vector3
  mesh?: THREE.Mesh
  userData: {
    initialX: number
    initialY: number
    initialZ: number
    x: number
    y: number
    z: number
  }
}

// Animation configuration
export interface AnimationConfig {
  duration: number
  easing: string
  showHighlight: boolean
}

// Control settings
export interface ControlSettings {
  animationSpeed: number
  showControls: boolean
  cameraSpeed: number
}

// Keyboard key mappings
export type KeyMapping = 'w' | 'a' | 's' | 'd' | 'q' | 'e'

// Move history for undo/redo
export interface MoveHistory {
  moves: string[]
  currentIndex: number
}

export type RubiksCubeState = 'idle' | 'animating' | 'shuffling'