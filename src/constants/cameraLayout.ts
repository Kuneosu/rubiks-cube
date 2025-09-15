import { CameraPosition } from '../types'

/**
 * 16개 카메라 배치 시스템 - 코너 기반
 * - 8개 상단 코너 카메라 (upper level)
 * - 8개 하단 코너 카메라 (lower level)
 * 
 * 배치 구조 (위에서 본 모습):
 * 
 *   0     1
 *     \ /
 * 7 --- + --- 2
 *     / \
 *   6     3
 *     4 5
 * 
 * 각 코너마다 상하 2개씩 총 16개 카메라
 */

const CAMERA_DISTANCE = 10  // 더 멀리 배치
const UPPER_HEIGHT = 5   // 상단 카메라 높이 증가
const LOWER_HEIGHT = 5   // 하단 카메라 높이를 상단과 동일하게

// 8개 코너 위치 (45도씩 배치)
const CORNER_ANGLES = [
  { angle: 0,    name: 'front-right' },    // 0
  { angle: 45,   name: 'right' },          // 1  
  { angle: 90,   name: 'back-right' },     // 2
  { angle: 135,  name: 'back' },           // 3
  { angle: 180,  name: 'back-left' },      // 4
  { angle: 225,  name: 'left' },           // 5
  { angle: 270,  name: 'front-left' },     // 6
  { angle: 315,  name: 'front' },          // 7
]

// 카메라 위치 정의 (16개 corner + 2개 overhead)
export const CAMERA_GRID: Record<string, CameraPosition & { 
  id: string
  name: string
  corner?: number
  level?: 'upper' | 'lower' | 'top' | 'bottom'
  type: 'corner' | 'overhead'
}> = {}

// 상단 레벨 카메라 (8개)
CORNER_ANGLES.forEach((corner, index) => {
  const radian = (corner.angle * Math.PI) / 180
  const x = Math.cos(radian) * CAMERA_DISTANCE
  const z = Math.sin(radian) * CAMERA_DISTANCE
  
  CAMERA_GRID[`upper-${index}`] = {
    id: `upper-${index}`,
    name: `Upper ${corner.name}`,
    position: [x, UPPER_HEIGHT, z],
    target: [0, 0, 0],
    corner: index,
    level: 'upper',
    type: 'corner'
  }
})

// 하단 레벨 카메라 (8개)
CORNER_ANGLES.forEach((corner, index) => {
  const radian = (corner.angle * Math.PI) / 180
  const x = Math.cos(radian) * CAMERA_DISTANCE
  const z = Math.sin(radian) * CAMERA_DISTANCE
  
  CAMERA_GRID[`lower-${index}`] = {
    id: `lower-${index}`,
    name: `Lower ${corner.name}`,
    position: [x, LOWER_HEIGHT, z],
    target: [0, 0, 0],
    corner: index,
    level: 'lower',
    type: 'corner'
  }
})

// Top 카메라 (위에서 아래로 보는 시점) - 4가지 회전 상태
const topCameraDistance = 15
const topRotations = [
  { id: 'top-0', angle: 0 },    // 기본 (front 방향)
  { id: 'top-1', angle: 90 },   // 90도 회전 (right 방향)
  { id: 'top-2', angle: 180 },  // 180도 회전 (back 방향)
  { id: 'top-3', angle: 270 },  // 270도 회전 (left 방향)
]

topRotations.forEach(({ id, angle }) => {
  const radian = (angle * Math.PI) / 180
  const x = Math.sin(radian) * 0.1  // 약간의 오프셋으로 방향 표시
  const z = Math.cos(radian) * 0.1
  
  CAMERA_GRID[id] = {
    id,
    name: `Top View ${angle}°`,
    position: [x, topCameraDistance, z],
    target: [0, 0, 0],
    level: 'top',
    type: 'overhead'
  }
})

// Bottom 카메라 (아래에서 위로 보는 시점) - 4가지 회전 상태
const bottomCameraDistance = -15
const bottomRotations = [
  { id: 'bottom-0', angle: 0 },    // 기본 (front 방향)
  { id: 'bottom-1', angle: 90 },   // 90도 회전 (right 방향)
  { id: 'bottom-2', angle: 180 },  // 180도 회전 (back 방향)
  { id: 'bottom-3', angle: 270 },  // 270도 회전 (left 방향)
]

bottomRotations.forEach(({ id, angle }) => {
  const radian = (angle * Math.PI) / 180
  const x = Math.sin(radian) * 0.1  // 약간의 오프셋으로 방향 표시
  const z = Math.cos(radian) * 0.1
  
  CAMERA_GRID[id] = {
    id,
    name: `Bottom View ${angle}°`,
    position: [x, bottomCameraDistance, z],
    target: [0, 0, 0],
    level: 'bottom',
    type: 'overhead'
  }
})

// 기본 top/bottom 카메라를 별도로 정의 (중복 키 방지)
CAMERA_GRID['top'] = {
  id: 'top',
  name: 'Top View',
  position: [0, topCameraDistance, 0],
  target: [0, 0, 0],
  level: 'top',
  type: 'overhead'
}

CAMERA_GRID['bottom'] = {
  id: 'bottom',
  name: 'Bottom View', 
  position: [0, bottomCameraDistance, 0],
  target: [0, 0, 0],
  level: 'bottom',
  type: 'overhead'
}

// 네비게이션 헬퍼 함수들
export function getOppositeCorner(corner: number): number {
  return (corner + 4) % 8
}

export function getNextCorner(corner: number): number {
  return (corner + 1) % 8
}

export function getPrevCorner(corner: number): number {
  return (corner + 7) % 8
}

export function toggleLevel(cameraId: string): string {
  const [level, cornerStr] = cameraId.split('-')
  const newLevel = level === 'upper' ? 'lower' : 'upper'
  return `${newLevel}-${cornerStr}`
}

export function getOppositeCameraId(cameraId: string): string {
  const [level, cornerStr] = cameraId.split('-')
  const corner = parseInt(cornerStr)
  const oppositeCorner = getOppositeCorner(corner)
  return `${level}-${oppositeCorner}`
}

export function getNextCameraId(cameraId: string): string {
  const [level, cornerStr] = cameraId.split('-')
  const corner = parseInt(cornerStr)
  const nextCorner = getNextCorner(corner)
  return `${level}-${nextCorner}`
}

export function getPrevCameraId(cameraId: string): string {
  const [level, cornerStr] = cameraId.split('-')
  const corner = parseInt(cornerStr)
  const prevCorner = getPrevCorner(corner)
  return `${level}-${prevCorner}`
}

// Top/Bottom 뷰 회전 함수들
export function getNextTopBottomView(cameraId: string): string {
  if (cameraId.startsWith('top-')) {
    const currentIndex = parseInt(cameraId.split('-')[1])
    const nextIndex = (currentIndex + 1) % 4
    return `top-${nextIndex}`
  } else if (cameraId.startsWith('bottom-')) {
    const currentIndex = parseInt(cameraId.split('-')[1])
    const nextIndex = (currentIndex + 1) % 4
    return `bottom-${nextIndex}`
  } else if (cameraId === 'top') {
    return 'top-1'
  } else if (cameraId === 'bottom') {
    return 'bottom-1'
  }
  return cameraId
}

export function getPrevTopBottomView(cameraId: string): string {
  if (cameraId.startsWith('top-')) {
    const currentIndex = parseInt(cameraId.split('-')[1])
    const prevIndex = (currentIndex + 3) % 4  // +3 is same as -1 mod 4
    return `top-${prevIndex}`
  } else if (cameraId.startsWith('bottom-')) {
    const currentIndex = parseInt(cameraId.split('-')[1])
    const prevIndex = (currentIndex + 3) % 4
    return `bottom-${prevIndex}`
  } else if (cameraId === 'top') {
    return 'top-3'
  } else if (cameraId === 'bottom') {
    return 'bottom-3'
  }
  return cameraId
}

export function isTopBottomView(cameraId: string): boolean {
  return cameraId === 'top' || cameraId === 'bottom' || 
         cameraId.startsWith('top-') || cameraId.startsWith('bottom-')
}