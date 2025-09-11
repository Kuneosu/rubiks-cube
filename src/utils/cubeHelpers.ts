import * as THREE from 'three';
import { 
  CubeState, 
  CubeletPosition, 
  CubeletType, 
  Cubelet, 
  Face, 
  Color, 
  FaceColor 
} from '../types/cube.types';
import { COLORS } from './constants';

/**
 * 초기 큐브 상태 생성
 * 6면 x 3x3 배열로 각 면의 색상 상태를 나타냄
 */
export function createInitialCubeState(): CubeState {
  const state: CubeState = [];
  
  // 각 면을 해당 색상으로 초기화
  for (let face = 0; face < 6; face++) {
    state[face] = [];
    for (let row = 0; row < 3; row++) {
      state[face][row] = [];
      for (let col = 0; col < 3; col++) {
        state[face][row][col] = face; // 면 번호 = 색상 번호
      }
    }
  }
  
  return state;
}

/**
 * 큐블렛 위치에서 큐블렛 타입 결정
 */
export function getCubeletType(position: CubeletPosition): CubeletType {
  const { x, y, z } = position;
  const nonZeroCount = [x, y, z].filter(coord => coord !== 0).length;
  
  if (nonZeroCount === 3) return 'corner';
  if (nonZeroCount === 2) return 'edge';
  return 'center';
}

/**
 * 큐블렛 위치에서 해당하는 면들 찾기
 */
export function getCubeletFaces(position: CubeletPosition): Face[] {
  const { x, y, z } = position;
  const faces: Face[] = [];
  
  if (y === 1) faces.push(Face.U);   // 위
  if (y === -1) faces.push(Face.D);  // 아래
  if (x === 1) faces.push(Face.R);   // 오른쪽
  if (x === -1) faces.push(Face.L);  // 왼쪽
  if (z === 1) faces.push(Face.F);   // 앞
  if (z === -1) faces.push(Face.B);  // 뒤
  
  return faces;
}

/**
 * 27개 큐블렛 생성
 */
export function createCubelets(): Cubelet[] {
  const cubelets: Cubelet[] = [];
  let id = 0;
  
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const position: CubeletPosition = { x: x as -1 | 0 | 1, y: y as -1 | 0 | 1, z: z as -1 | 0 | 1 };
        const type = getCubeletType(position);
        const visibleFaces = getCubeletFaces(position);
        
        const faces: FaceColor[] = visibleFaces.map(face => ({
          face,
          color: face as Color // 초기 상태에서는 면 번호 = 색상 번호
        }));
        
        cubelets.push({
          id: `cubelet-${id++}`,
          position,
          rotation: new THREE.Quaternion(),
          type,
          faces
        });
      }
    }
  }
  
  return cubelets;
}

/**
 * 큐블렛이 특정 면에 속하는지 확인
 */
export function isCubeletOnFace(cubelet: Cubelet, face: Face): boolean {
  const { x, y, z } = cubelet.position;
  
  switch (face) {
    case Face.U: return y === 1;
    case Face.D: return y === -1;
    case Face.R: return x === 1;
    case Face.L: return x === -1;
    case Face.F: return z === 1;
    case Face.B: return z === -1;
    default: return false;
  }
}

/**
 * 특정 면의 큐블렛들 필터링
 */
export function getCubeletsOnFace(cubelets: Cubelet[], face: Face): Cubelet[] {
  return cubelets.filter(cubelet => isCubeletOnFace(cubelet, face));
}

/**
 * 위치를 3D 좌표로 변환
 */
export function positionToCoordinates(position: CubeletPosition): [number, number, number] {
  return [position.x, position.y, position.z];
}

/**
 * 3D 좌표를 위치로 변환
 */
export function coordinatesToPosition(x: number, y: number, z: number): CubeletPosition {
  return {
    x: Math.round(x) as -1 | 0 | 1,
    y: Math.round(y) as -1 | 0 | 1,
    z: Math.round(z) as -1 | 0 | 1
  };
}

/**
 * 큐브가 해결되었는지 확인
 */
export function isCubeSolved(cubeState: CubeState): boolean {
  for (let face = 0; face < 6; face++) {
    const centerColor = cubeState[face][1][1];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (cubeState[face][row][col] !== centerColor) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * 색상에서 Three.js 색상으로 변환
 */
export function getThreeColor(color: Color): THREE.Color {
  return new THREE.Color(COLORS[color]);
}

/**
 * 큐브 상태를 문자열로 변환 (디버깅용)
 */
export function cubeStateToString(cubeState: CubeState): string {
  const faceNames = ['U', 'R', 'F', 'D', 'L', 'B'];
  const colorNames = ['W', 'R', 'G', 'Y', 'O', 'B'];
  
  let result = '';
  for (let face = 0; face < 6; face++) {
    result += `${faceNames[face]}:\n`;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        result += colorNames[cubeState[face][row][col]] + ' ';
      }
      result += '\n';
    }
    result += '\n';
  }
  return result;
}

/**
 * Stewart Smith 영감 - 큐블렛 그룹 생성 함수
 */
export function createCubeletGroup(
  cubelets: Cubelet[],
  selector: (cubelet: Cubelet) => boolean,
  id: string
): Cubelet[] {
  return cubelets.filter(selector);
}

/**
 * 특정 조건으로 큐블렛 선택 (Stewart Smith 패턴)
 */
export const CubeletSelectors = {
  // 모든 코너 큐블렛
  corners: (cubelet: Cubelet) => cubelet.type === 'corner',
  
  // 모든 엣지 큐블렛
  edges: (cubelet: Cubelet) => cubelet.type === 'edge',
  
  // 모든 센터 큐블렛
  centers: (cubelet: Cubelet) => cubelet.type === 'center',
  
  // 특정 면의 큐블렛들
  face: (face: Face) => (cubelet: Cubelet) => isCubeletOnFace(cubelet, face),
  
  // 특정 위치의 큐블렛
  position: (pos: CubeletPosition) => (cubelet: Cubelet) => 
    cubelet.position.x === pos.x && 
    cubelet.position.y === pos.y && 
    cubelet.position.z === pos.z
};