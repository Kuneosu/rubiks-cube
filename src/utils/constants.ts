import { Face, Color } from '../types/cube.types';

// 큐브 물리적 상수
export const CUBE_SIZE = 1.8;
export const CUBELET_SIZE = 0.9;
export const CUBELET_GAP = 0.05;
export const CORNER_RADIUS = 0.08;

// 애니메이션 상수
export const ANIMATION_DURATION = 200; // ms
export const CAMERA_DISTANCE = 6;
export const CAMERA_FOV = 50;

// 색상 상수 (Stewart Smith 스타일)
export const COLORS = {
  [Color.WHITE]: 0xFFFFFF,   // U - White
  [Color.RED]: 0xC41E3A,     // R - Red  
  [Color.GREEN]: 0x009E60,   // F - Green
  [Color.YELLOW]: 0xFFD500,  // D - Yellow
  [Color.ORANGE]: 0xFF5800,  // L - Orange
  [Color.BLUE]: 0x0051BA     // B - Blue
} as const;

// 면 벡터 (회전축)
export const FACE_VECTORS = {
  [Face.U]: [0, 1, 0],   // Y축
  [Face.D]: [0, -1, 0],  // -Y축
  [Face.R]: [1, 0, 0],   // X축
  [Face.L]: [-1, 0, 0],  // -X축
  [Face.F]: [0, 0, 1],   // Z축
  [Face.B]: [0, 0, -1]   // -Z축
} as const;

// 면 이름 매핑
export const FACE_NAMES = {
  [Face.U]: 'U',
  [Face.R]: 'R', 
  [Face.F]: 'F',
  [Face.D]: 'D',
  [Face.L]: 'L',
  [Face.B]: 'B'
} as const;

// 반대 면 매핑
export const OPPOSITE_FACES = {
  [Face.U]: Face.D,
  [Face.D]: Face.U,
  [Face.R]: Face.L,
  [Face.L]: Face.R,
  [Face.F]: Face.B,
  [Face.B]: Face.F
} as const;

// 키보드 입력 상수 (Singmaster + Stewart Smith)
export const KEY_MAPPINGS = {
  // 기본 회전 (Singmaster 표준)
  'KeyR': 'R',
  'KeyL': 'L',
  'KeyU': 'U',
  'KeyD': 'D',
  'KeyF': 'F',
  'KeyB': 'B',
  
  // Stewart Smith 스타일 (소문자 = 반시계방향)
  'KeyR+lowercase': 'r',
  'KeyL+lowercase': 'l',
  'KeyU+lowercase': 'u',
  'KeyD+lowercase': 'd',
  'KeyF+lowercase': 'f',
  'KeyB+lowercase': 'b',
  
  // 중간층 회전
  'KeyM': 'M',
  'KeyE': 'E',
  'KeyS': 'S',
  
  // 큐브 전체 회전
  'KeyX': 'x',
  'KeyY': 'y',
  'KeyZ': 'z',
  
  // 제어 키
  'Space': 'timer',
  'Escape': 'reset',
  'KeyS+solo': 'scramble'
} as const;

// 스크램블 이동 목록
export const SCRAMBLE_MOVES = [
  'R', 'L', 'U', 'D', 'F', 'B',
  "R'", "L'", "U'", "D'", "F'", "B'",
  'R2', 'L2', 'U2', 'D2', 'F2', 'B2'
] as const;

// 성능 상수
export const PERFORMANCE = {
  TARGET_FPS: 60,
  MAX_HISTORY: 1000,
  SCRAMBLE_LENGTH: 25,
  INSPECTION_TIME: 15000, // 15초
  WARNING_8S: 8000,
  WARNING_12S: 12000
} as const;

// 카메라 설정
export const CAMERA_SETTINGS = {
  POSITION: [4, 4, 4],
  NEAR: 0.1,
  FAR: 1000,
  MIN_DISTANCE: 3,
  MAX_DISTANCE: 15
} as const;