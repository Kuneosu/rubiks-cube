/**
 * Shared constants and utility functions
 */

// Position comparison tolerances
export const POSITION_TOLERANCE = 0.1 // For cube position matching
export const LAYER_TOLERANCE = 0.5 // For layer detection in rotations

/**
 * Shared time formatting utility
 */
export function formatTime(time: number): string {
  const minutes = Math.floor(time / 60000)
  const seconds = Math.floor((time % 60000) / 1000)
  const milliseconds = Math.floor((time % 1000))

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  } else {
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}`
  }
}

/**
 * Checks if two positions are approximately equal within tolerance
 */
export function isPositionEqual(pos1: number, pos2: number, tolerance = POSITION_TOLERANCE): boolean {
  return Math.abs(pos1 - pos2) < tolerance
}