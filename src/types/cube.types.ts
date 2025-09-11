import * as THREE from 'three';

// 큐브 면 정의 (ARCHITECTURE.md 기준)
export enum Face {
  U = 0, // Up (White)
  R = 1, // Right (Red)
  F = 2, // Front (Green)
  D = 3, // Down (Yellow)
  L = 4, // Left (Orange)
  B = 5  // Back (Blue)
}

// 색상 정의
export enum Color {
  WHITE = 0,
  RED = 1,
  GREEN = 2,
  YELLOW = 3,
  ORANGE = 4,
  BLUE = 5
}

// 큐브 상태 (6x3x3 배열)
export type CubeState = number[][][]; // [face][row][col]

// 큐블렛 위치
export interface CubeletPosition {
  x: -1 | 0 | 1; // Left-Center-Right
  y: -1 | 0 | 1; // Bottom-Center-Top
  z: -1 | 0 | 1; // Back-Center-Front
}

// 큐블렛 타입
export type CubeletType = 'corner' | 'edge' | 'center';

// 면 색상
export interface FaceColor {
  face: Face;
  color: Color;
}

// 큐블렛 정의
export interface Cubelet {
  id: string;
  position: CubeletPosition;
  rotation: THREE.Quaternion;
  type: CubeletType;
  faces: FaceColor[];
}

// 회전 방향
export type Direction = 1 | -1; // 1: 시계방향, -1: 반시계방향

// 이동 명령
export interface Move {
  face: Face | string; // Face enum 또는 'M', 'E', 'S', 'x', 'y', 'z'
  direction: Direction;
  angle?: number; // 90도 또는 180도
}

// Stewart Smith 영감 - Flexible Grouping System
export interface CubeGroup {
  id: string;
  cubelets: Cubelet[];
  canRotate: boolean;
  
  // Fluent Interface 패턴
  rotate(face: Face): this;
  highlight(): this;
  explode(radius?: number): this;
  reset(): this;
}

// 타이머 세션
export interface Session {
  id: string;
  time: number;
  scramble: string;
  date: Date;
  penalty?: 'DNF' | '+2';
}

// 타이머 통계
export interface TimerStats {
  currentTime: number;
  bestTime: number;
  ao5: number;
  ao12: number;
  ao100: number;
}

// 애니메이션 상태
export interface AnimationState {
  isAnimating: boolean;
  queue: Move[];
  duration: number;
}

// 큐브 설정
export interface CubeSettings {
  animationDuration: number;
  showWireframe: boolean;
  cubeletGap: number;
  enableShadows: boolean;
  colorScheme: 'standard' | 'custom';
}

// 색상 스킴
export const FACE_COLORS = {
  [Color.WHITE]: 0xFFFFFF,   // U - White
  [Color.RED]: 0xC41E3A,     // R - Red
  [Color.GREEN]: 0x009E60,   // F - Green
  [Color.YELLOW]: 0xFFD500,  // D - Yellow
  [Color.ORANGE]: 0xFF5800,  // L - Orange
  [Color.BLUE]: 0x0051BA     // B - Blue
} as const;

// 키보드 입력 매핑
export interface KeyMapping {
  [key: string]: () => void;
}

// 입력 모디파이어
export interface InputModifiers {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  num2: boolean;
}