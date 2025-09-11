import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  CubeState, 
  Move, 
  Face, 
  Direction, 
  Cubelet, 
  CubeSettings 
} from '../types/cube.types';
import { 
  createInitialCubeState, 
  createCubelets, 
  isCubeSolved 
} from '../utils/cubeHelpers';

interface CubeStore {
  // State
  cubeState: CubeState;
  cubelets: Cubelet[];
  isAnimating: boolean;
  animationQueue: Move[];
  settings: CubeSettings;
  
  // Actions
  rotateFace: (face: Face | string, direction: Direction, angle?: number) => void;
  scramble: () => void;
  reset: () => void;
  queueMove: (move: Move) => void;
  processQueue: () => void;
  setAnimating: (animating: boolean) => void;
  updateSettings: (settings: Partial<CubeSettings>) => void;
  
  // Getters
  isSolved: () => boolean;
}

const defaultSettings: CubeSettings = {
  animationDuration: 200,
  showWireframe: false,
  cubeletGap: 0.05,
  enableShadows: true,
  colorScheme: 'standard'
};

export const useCubeStore = create<CubeStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      cubeState: createInitialCubeState(),
      cubelets: createCubelets(),
      isAnimating: false,
      animationQueue: [],
      settings: defaultSettings,
      
      // Actions
      rotateFace: (face: Face | string, direction: Direction, angle = 90) => {
        const { isAnimating, animationQueue, cubelets, cubeState } = get();
        
        // 애니메이션 중이면 큐에 추가
        if (isAnimating) {
          const move: Move = { 
            face, 
            direction, 
            angle 
          };
          set(state => ({
            animationQueue: [...state.animationQueue, move]
          }));
          return;
        }
        
        // Face enum이 아닌 경우 (M, E, S, x, y, z) 처리
        if (typeof face === 'string' && !Object.values(Face).includes(face as Face)) {
          console.log(`Special rotation: ${face} ${direction > 0 ? 'CW' : 'CCW'} ${angle}°`);
          return;
        }
        
        const faceEnum = face as Face;
        console.log(`Rotating ${Face[faceEnum]} ${direction > 0 ? 'clockwise' : 'counterclockwise'} ${angle}°`);
        
        set({ isAnimating: true });
        
        // 애니메이션 시뮬레이션 (GSAP이나 실제 애니메이션으로 대체 예정)
        setTimeout(() => {
          // 회전 로직 import (동적 import로 순환 참조 방지)
          import('../utils/rotationLogic').then(({ rotateCubelets, rotateFaceInState }) => {
            const newCubelets = rotateCubelets(cubelets, faceEnum, direction, angle);
            const newCubeState = rotateFaceInState(cubeState, faceEnum, direction, angle);
            
            set({
              cubelets: newCubelets,
              cubeState: newCubeState,
              isAnimating: false
            });
            
            get().processQueue();
          });
        }, get().settings.animationDuration);
      },
      
      scramble: () => {
        const { isAnimating } = get();
        if (isAnimating) return;
        
        // WCA 표준 25수 스크램블 생성
        const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
        const modifiers = ['', "'", '2'];
        const scrambleMoves: Move[] = [];
        
        let lastMove = '';
        let lastAxis = '';
        
        for (let i = 0; i < 25; i++) {
          let move = moves[Math.floor(Math.random() * moves.length)];
          
          // 같은 면 연속 방지
          while (move === lastMove) {
            move = moves[Math.floor(Math.random() * moves.length)];
          }
          
          const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
          const direction: Direction = modifier === "'" ? -1 : 1;
          const angle = modifier === '2' ? 180 : 90;
          
          scrambleMoves.push({
            face: move as Face,
            direction,
            angle
          });
          
          lastMove = move;
        }
        
        // 스크램블 실행
        set({ animationQueue: scrambleMoves });
        get().processQueue();
      },
      
      reset: () => {
        set({
          cubeState: createInitialCubeState(),
          cubelets: createCubelets(),
          isAnimating: false,
          animationQueue: []
        });
      },
      
      queueMove: (move: Move) => {
        set(state => ({
          animationQueue: [...state.animationQueue, move]
        }));
      },
      
      processQueue: () => {
        const { animationQueue, isAnimating } = get();
        
        if (isAnimating || animationQueue.length === 0) return;
        
        const nextMove = animationQueue[0];
        set(state => ({
          animationQueue: state.animationQueue.slice(1)
        }));
        
        get().rotateFace(nextMove.face, nextMove.direction, nextMove.angle);
      },
      
      setAnimating: (animating: boolean) => {
        set({ isAnimating: animating });
        if (!animating) {
          // 애니메이션 완료 후 큐 처리
          setTimeout(() => get().processQueue(), 10);
        }
      },
      
      updateSettings: (newSettings: Partial<CubeSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      // Getters
      isSolved: () => {
        const { cubeState } = get();
        return isCubeSolved(cubeState);
      }
    }),
    {
      name: 'cube-store',
      partialize: (state) => ({
        settings: state.settings
      })
    }
  )
);