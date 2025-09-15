import { getCameraRelativeMapping as getMathematicalMapping } from './cameraRelativeMath'

/**
 * Camera-relative mapping system
 * Now uses mathematical calculations instead of manual mappings
 */
export function getCameraRelativeMapping(currentCamera: string): Record<string, string> {
  // Use the mathematical system for consistent, predictable mappings
  return getMathematicalMapping(currentCamera)
}