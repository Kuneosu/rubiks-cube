import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Move } from '../types/cube.types';
import { PERFORMANCE } from '../utils/constants';

interface HistoryStore {
  // State
  history: Move[];
  currentIndex: number;
  maxHistory: number;
  
  // Actions
  addMove: (move: Move) => void;
  undo: () => Move | null;
  redo: () => Move | null;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Getters
  getCurrentMoves: () => Move[];
  getMoveString: (move: Move) => string;
  getHistoryString: () => string;
}

// Command Pattern을 위한 역방향 이동 생성
function getInverseMove(move: Move): Move {
  return {
    ...move,
    direction: (move.direction * -1) as 1 | -1
  };
}

// 이동을 문자열로 변환 (Singmaster 표기법)
function moveToString(move: Move): string {
  const { face, direction, angle = 90 } = move;
  
  let notation = face.toString();
  
  if (angle === 180) {
    notation += '2';
  } else if (direction === -1) {
    notation += "'";
  }
  
  return notation;
}

export const useHistoryStore = create<HistoryStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      history: [],
      currentIndex: -1,
      maxHistory: PERFORMANCE.MAX_HISTORY,
      
      // Actions
      addMove: (move: Move) => {
        set(state => {
          // 현재 인덱스 이후의 히스토리 제거 (분기 관리)
          const newHistory = state.history.slice(0, state.currentIndex + 1);
          
          // 새 이동 추가
          newHistory.push(move);
          
          // 최대 히스토리 제한
          if (newHistory.length > state.maxHistory) {
            newHistory.shift();
          }
          
          return {
            history: newHistory,
            currentIndex: newHistory.length - 1
          };
        });
      },
      
      undo: (): Move | null => {
        const { history, currentIndex } = get();
        
        if (currentIndex < 0) return null;
        
        const moveToUndo = history[currentIndex];
        const inverseMove = getInverseMove(moveToUndo);
        
        set(state => ({
          currentIndex: state.currentIndex - 1
        }));
        
        return inverseMove;
      },
      
      redo: (): Move | null => {
        const { history, currentIndex } = get();
        
        if (currentIndex >= history.length - 1) return null;
        
        const newIndex = currentIndex + 1;
        const moveToRedo = history[newIndex];
        
        set({ currentIndex: newIndex });
        
        return moveToRedo;
      },
      
      clear: () => {
        set({
          history: [],
          currentIndex: -1
        });
      },
      
      canUndo: (): boolean => {
        const { currentIndex } = get();
        return currentIndex >= 0;
      },
      
      canRedo: (): boolean => {
        const { history, currentIndex } = get();
        return currentIndex < history.length - 1;
      },
      
      // Getters
      getCurrentMoves: (): Move[] => {
        const { history, currentIndex } = get();
        return history.slice(0, currentIndex + 1);
      },
      
      getMoveString: (move: Move): string => {
        return moveToString(move);
      },
      
      getHistoryString: (): string => {
        const { history, currentIndex } = get();
        const currentMoves = history.slice(0, currentIndex + 1);
        return currentMoves.map(moveToString).join(' ');
      }
    }),
    {
      name: 'history-store'
    }
  )
);