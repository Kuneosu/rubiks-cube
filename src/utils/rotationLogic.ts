import * as THREE from 'three';
import { 
  CubeState, 
  Cubelet, 
  Face, 
  Direction, 
  CubeletPosition 
} from '../types/cube.types';
import { 
  isCubeletOnFace, 
  getCubeletsOnFace,
  coordinatesToPosition 
} from './cubeHelpers';
import { FACE_VECTORS } from './constants';

/**
 * 면 회전을 위한 회전 행렬 생성
 */
export function createRotationMatrix(face: Face, direction: Direction, angle = 90): THREE.Matrix4 {
  const axis = new THREE.Vector3(...FACE_VECTORS[face]);
  const radians = (angle * direction * Math.PI) / 180;
  
  const matrix = new THREE.Matrix4();
  matrix.makeRotationAxis(axis, radians);
  
  return matrix;
}

/**
 * 큐블렛 위치를 회전 변환
 */
export function rotatePosition(
  position: CubeletPosition, 
  face: Face, 
  direction: Direction,
  angle = 90
): CubeletPosition {
  const vector = new THREE.Vector3(position.x, position.y, position.z);
  const matrix = createRotationMatrix(face, direction, angle);
  
  vector.applyMatrix4(matrix);
  
  // 부동소수점 오차 수정
  return coordinatesToPosition(
    Math.round(vector.x), 
    Math.round(vector.y), 
    Math.round(vector.z)
  );
}

/**
 * 큐블렛 회전 업데이트
 */
export function rotateCubelets(
  cubelets: Cubelet[], 
  face: Face, 
  direction: Direction,
  angle = 90
): Cubelet[] {
  const rotationMatrix = createRotationMatrix(face, direction, angle);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
  
  return cubelets.map(cubelet => {
    // 해당 면의 큐블렛만 회전
    if (!isCubeletOnFace(cubelet, face)) {
      return cubelet;
    }
    
    // 위치 회전
    const newPosition = rotatePosition(cubelet.position, face, direction, angle);
    
    // 쿼터니언 회전
    const newRotation = cubelet.rotation.clone().multiply(quaternion);
    
    return {
      ...cubelet,
      position: newPosition,
      rotation: newRotation
    };
  });
}

/**
 * 2D 배열을 시계방향으로 90도 회전
 */
function rotate2DArrayClockwise<T>(matrix: T[][]): T[][] {
  const n = matrix.length;
  const rotated: T[][] = Array(n).fill(null).map(() => Array(n).fill(null));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[j][n - 1 - i] = matrix[i][j];
    }
  }
  
  return rotated;
}

/**
 * 2D 배열을 반시계방향으로 90도 회전
 */
function rotate2DArrayCounterClockwise<T>(matrix: T[][]): T[][] {
  const n = matrix.length;
  const rotated: T[][] = Array(n).fill(null).map(() => Array(n).fill(null));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[n - 1 - j][i] = matrix[i][j];
    }
  }
  
  return rotated;
}

/**
 * 2D 배열을 180도 회전
 */
function rotate2DArray180<T>(matrix: T[][]): T[][] {
  const n = matrix.length;
  const rotated: T[][] = Array(n).fill(null).map(() => Array(n).fill(null));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[n - 1 - i][n - 1 - j] = matrix[i][j];
    }
  }
  
  return rotated;
}

/**
 * 큐브 상태의 면 회전
 */
export function rotateFaceInState(
  cubeState: CubeState, 
  face: Face, 
  direction: Direction,
  angle = 90
): CubeState {
  const newState = cubeState.map(faceState => 
    faceState.map(row => [...row])
  );
  
  const faceMatrix = newState[face];
  
  if (angle === 180) {
    newState[face] = rotate2DArray180(faceMatrix);
  } else if (direction === 1) {
    newState[face] = rotate2DArrayClockwise(faceMatrix);
  } else {
    newState[face] = rotate2DArrayCounterClockwise(faceMatrix);
  }
  
  // 인접한 면들의 가장자리 회전도 처리해야 함
  // TODO: 인접 면 처리 로직 구현
  rotateAdjacentEdges(newState, face, direction, angle);
  
  return newState;
}

/**
 * 인접 면들의 가장자리 회전 처리
 */
function rotateAdjacentEdges(
  cubeState: CubeState, 
  face: Face, 
  direction: Direction,
  angle = 90
): void {
  // 각 면별 인접 면과 해당 가장자리 정의
  const adjacentFaces: { [key in Face]: Array<{face: Face, edge: number[]}> } = {
    [Face.U]: [
      { face: Face.F, edge: [0, 0, 0, 1, 0, 2] }, // F의 윗줄
      { face: Face.R, edge: [0, 0, 0, 1, 0, 2] }, // R의 윗줄
      { face: Face.B, edge: [0, 0, 0, 1, 0, 2] }, // B의 윗줄
      { face: Face.L, edge: [0, 0, 0, 1, 0, 2] }  // L의 윗줄
    ],
    [Face.D]: [
      { face: Face.F, edge: [2, 0, 2, 1, 2, 2] }, // F의 아랫줄
      { face: Face.L, edge: [2, 0, 2, 1, 2, 2] }, // L의 아랫줄
      { face: Face.B, edge: [2, 0, 2, 1, 2, 2] }, // B의 아랫줄
      { face: Face.R, edge: [2, 0, 2, 1, 2, 2] }  // R의 아랫줄
    ],
    [Face.R]: [
      { face: Face.U, edge: [0, 2, 1, 2, 2, 2] }, // U의 오른쪽 줄
      { face: Face.F, edge: [0, 2, 1, 2, 2, 2] }, // F의 오른쪽 줄
      { face: Face.D, edge: [0, 2, 1, 2, 2, 2] }, // D의 오른쪽 줄
      { face: Face.B, edge: [2, 0, 1, 0, 0, 0] }  // B의 왼쪽 줄 (뒤집힌 상태)
    ],
    [Face.L]: [
      { face: Face.U, edge: [0, 0, 1, 0, 2, 0] }, // U의 왼쪽 줄
      { face: Face.B, edge: [2, 2, 1, 2, 0, 2] }, // B의 오른쪽 줄 (뒤집힌 상태)
      { face: Face.D, edge: [0, 0, 1, 0, 2, 0] }, // D의 왼쪽 줄
      { face: Face.F, edge: [0, 0, 1, 0, 2, 0] }  // F의 왼쪽 줄
    ],
    [Face.F]: [
      { face: Face.U, edge: [2, 0, 2, 1, 2, 2] }, // U의 아랫줄
      { face: Face.R, edge: [0, 0, 1, 0, 2, 0] }, // R의 왼쪽 줄
      { face: Face.D, edge: [0, 0, 0, 1, 0, 2] }, // D의 윗줄
      { face: Face.L, edge: [2, 2, 1, 2, 0, 2] }  // L의 오른쪽 줄
    ],
    [Face.B]: [
      { face: Face.U, edge: [0, 2, 0, 1, 0, 0] }, // U의 윗줄 (뒤집힌 상태)
      { face: Face.L, edge: [0, 0, 1, 0, 2, 0] }, // L의 왼쪽 줄
      { face: Face.D, edge: [2, 2, 2, 1, 2, 0] }, // D의 아랫줄 (뒤집힌 상태)
      { face: Face.R, edge: [2, 2, 1, 2, 0, 2] }  // R의 오른쪽 줄
    ]
  };
  
  const edges = adjacentFaces[face];
  const temp: number[] = [];
  
  // 첫 번째 면의 가장자리 저장
  const firstEdge = edges[0];
  for (let i = 0; i < 6; i += 2) {
    temp.push(cubeState[firstEdge.face][firstEdge.edge[i]][firstEdge.edge[i + 1]]);
  }
  
  // 회전 방향에 따라 가장자리 이동
  if (direction === 1) { // 시계방향
    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
      const currentEdge = edges[edgeIndex];
      const nextEdge = edges[(edgeIndex + 1) % edges.length];
      
      for (let i = 0; i < 6; i += 2) {
        cubeState[currentEdge.face][currentEdge.edge[i]][currentEdge.edge[i + 1]] = 
          cubeState[nextEdge.face][nextEdge.edge[i]][nextEdge.edge[i + 1]];
      }
    }
    
    // 마지막 면에 임시 저장된 값 적용
    const lastEdge = edges[edges.length - 1];
    for (let i = 0; i < 6; i += 2) {
      cubeState[lastEdge.face][lastEdge.edge[i]][lastEdge.edge[i + 1]] = temp[i / 2];
    }
  } else { // 반시계방향
    for (let edgeIndex = edges.length - 1; edgeIndex >= 0; edgeIndex--) {
      const currentEdge = edges[edgeIndex];
      const prevEdge = edges[(edgeIndex - 1 + edges.length) % edges.length];
      
      for (let i = 0; i < 6; i += 2) {
        cubeState[currentEdge.face][currentEdge.edge[i]][currentEdge.edge[i + 1]] = 
          cubeState[prevEdge.face][prevEdge.edge[i]][prevEdge.edge[i + 1]];
      }
    }
    
    // 첫 번째 면에 임시 저장된 값 적용
    const firstEdge = edges[0];
    for (let i = 0; i < 6; i += 2) {
      cubeState[firstEdge.face][firstEdge.edge[i]][firstEdge.edge[i + 1]] = temp[i / 2];
    }
  }
}