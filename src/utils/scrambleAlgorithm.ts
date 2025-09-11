import { Move, Face, Direction } from '../types/cube.types';
import { SCRAMBLE_MOVES } from './constants';

/**
 * WCA 표준 스크램블 생성기
 * 25수 랜덤 스크램블 (3x3x3 표준)
 */
export function generateScramble(): Move[] {
  const moves: Move[] = [];
  const faceNames = ['R', 'L', 'U', 'D', 'F', 'B'];
  const modifiers = ['', "'", '2'];
  
  let lastMove = '';
  let lastAxis = '';
  
  // 축 그룹 정의 (같은 축의 면들은 연속으로 나오면 안됨)
  const axisGroups: { [key: string]: string } = {
    'R': 'x', 'L': 'x',  // X축
    'U': 'y', 'D': 'y',  // Y축  
    'F': 'z', 'B': 'z'   // Z축
  };
  
  for (let i = 0; i < 25; i++) {
    let face: string;
    let attempts = 0;
    
    do {
      face = faceNames[Math.floor(Math.random() * faceNames.length)];
      attempts++;
      
      // 무한 루프 방지
      if (attempts > 100) break;
      
    } while (
      // 같은 면 연속 방지
      face === lastMove ||
      // 같은 축의 면 연속 방지 (R L, U D, F B)
      (lastAxis && axisGroups[face] === lastAxis)
    );
    
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    const direction: Direction = modifier === "'" ? -1 : 1;
    const angle = modifier === '2' ? 180 : 90;
    
    // Face enum으로 변환
    const faceEnum = Face[face as keyof typeof Face];
    
    moves.push({
      face: faceEnum,
      direction,
      angle
    });
    
    lastMove = face;
    lastAxis = axisGroups[face];
  }
  
  return moves;
}

/**
 * 스크램블을 문자열로 변환 (Singmaster 표기법)
 */
export function scrambleToString(moves: Move[]): string {
  return moves.map(move => {
    const faceName = Face[move.face];
    let notation = faceName;
    
    if (move.angle === 180) {
      notation += '2';
    } else if (move.direction === -1) {
      notation += "'";
    }
    
    return notation;
  }).join(' ');
}

/**
 * 문자열에서 스크램블 파싱
 */
export function parseScramble(scrambleString: string): Move[] {
  const moves: Move[] = [];
  const tokens = scrambleString.trim().split(/\s+/);
  
  for (const token of tokens) {
    if (!token) continue;
    
    // 면 추출
    const faceChar = token[0].toUpperCase();
    if (!['R', 'L', 'U', 'D', 'F', 'B'].includes(faceChar)) {
      continue; // 잘못된 면
    }
    
    const face = Face[faceChar as keyof typeof Face];
    let direction: Direction = 1;
    let angle = 90;
    
    // 수식어 파싱
    const modifier = token.substring(1);
    if (modifier === "'") {
      direction = -1;
    } else if (modifier === '2') {
      angle = 180;
    } else if (modifier === "2'") {
      angle = 180;
      direction = -1;
    }
    
    moves.push({ face, direction, angle });
  }
  
  return moves;
}

/**
 * 스크램블의 역방향 생성 (해결용)
 */
export function getInverseScramble(moves: Move[]): Move[] {
  return moves
    .slice()
    .reverse()
    .map(move => ({
      ...move,
      direction: (move.direction * -1) as Direction
    }));
}

/**
 * 스크램블 유효성 검사
 */
export function validateScramble(moves: Move[]): boolean {
  if (moves.length === 0) return false;
  
  // 연속된 같은 면 체크
  for (let i = 1; i < moves.length; i++) {
    if (moves[i].face === moves[i-1].face) {
      return false;
    }
  }
  
  // 축 그룹 연속 체크
  const axisGroups = {
    [Face.R]: 'x', [Face.L]: 'x',
    [Face.U]: 'y', [Face.D]: 'y',
    [Face.F]: 'z', [Face.B]: 'z'
  };
  
  for (let i = 1; i < moves.length; i++) {
    const currentAxis = axisGroups[moves[i].face];
    const prevAxis = axisGroups[moves[i-1].face];
    
    if (currentAxis === prevAxis) {
      return false;
    }
  }
  
  return true;
}

/**
 * 스크램블 최적화 (불필요한 이동 제거)
 */
export function optimizeScramble(moves: Move[]): Move[] {
  const optimized: Move[] = [];
  
  for (const move of moves) {
    const lastMove = optimized[optimized.length - 1];
    
    // 같은 면의 연속 이동 통합
    if (lastMove && lastMove.face === move.face) {
      const totalAngle = (lastMove.angle * lastMove.direction) + (move.angle * move.direction);
      const normalizedAngle = ((totalAngle % 360) + 360) % 360;
      
      if (normalizedAngle === 0) {
        // 상쇄됨 - 마지막 이동 제거
        optimized.pop();
      } else if (normalizedAngle === 90) {
        lastMove.direction = 1;
        lastMove.angle = 90;
      } else if (normalizedAngle === 180) {
        lastMove.direction = 1;
        lastMove.angle = 180;
      } else if (normalizedAngle === 270) {
        lastMove.direction = -1;
        lastMove.angle = 90;
      }
    } else {
      optimized.push({ ...move });
    }
  }
  
  return optimized;
}

/**
 * 프리셋 스크램블들
 */
export const PRESET_SCRAMBLES = {
  easy: "R U R' U' R U R'",
  medium: "R U R' F' R U R' U' R' F R2 U' R'",
  hard: "R U R' U' R U R' F' R U R' U' R' F R2 U' R' U R U' R'",
  superflip: "R U R' F' R U R' U' R' F R2 U' R' U R U' R'",
  checkerboard: "M2 E2 S2"
} as const;