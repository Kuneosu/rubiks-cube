import { useEffect, useCallback } from 'react';
import { useCubeStore } from '../store/cubeStore';
import { useTimerStore } from '../store/timerStore';
import { useHistoryStore } from '../store/historyStore';
import { Face } from '../types/cube.types';

interface KeyModifiers {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

export function useKeyboard() {
  const { rotateFace, scramble, reset, isAnimating } = useCubeStore();
  const { start, stop, reset: resetTimer, isRunning, isPriming, prime, unprime } = useTimerStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 애니메이션 중이면 입력 차단 (타이머 제어 제외)
    if (isAnimating && !['Space', 'Escape'].includes(event.code)) {
      return;
    }

    const modifiers: KeyModifiers = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey || event.metaKey,
      alt: event.altKey,
      meta: event.metaKey
    };

    const key = event.code;
    
    // 기본 동작 방지 (필요한 경우)
    const preventKeys = [
      'Space', 'KeyR', 'KeyL', 'KeyU', 'KeyD', 'KeyF', 'KeyB',
      'KeyM', 'KeyE', 'KeyS', 'KeyX', 'KeyY', 'KeyZ'
    ];
    
    if (preventKeys.includes(key)) {
      event.preventDefault();
    }

    // 타이머 제어
    if (key === 'Space') {
      if (isRunning) {
        stop();
      } else if (isPriming) {
        start();
      } else {
        prime();
      }
      return;
    }

    // 전역 제어
    if (key === 'Escape') {
      if (isRunning) {
        stop();
        resetTimer();
      } else {
        reset();
        resetTimer();
      }
      return;
    }

    // Undo/Redo
    if (modifiers.ctrl) {
      if (key === 'KeyZ' && !modifiers.shift && canUndo()) {
        const undoMove = undo();
        if (undoMove) {
          rotateFace(undoMove.face, undoMove.direction, undoMove.angle);
        }
        return;
      }
      
      if ((key === 'KeyY' || (key === 'KeyZ' && modifiers.shift)) && canRedo()) {
        const redoMove = redo();
        if (redoMove) {
          rotateFace(redoMove.face, redoMove.direction, redoMove.angle);
        }
        return;
      }
    }

    // 스크램블 (S 단독)
    if (key === 'KeyS' && !modifiers.shift && !modifiers.ctrl && !modifiers.alt) {
      scramble();
      return;
    }

    // 기본 면 회전 (Singmaster + Stewart Smith 스타일)
    const faceMap: { [key: string]: Face } = {
      'KeyR': Face.R,
      'KeyL': Face.L,
      'KeyU': Face.U,
      'KeyD': Face.D,
      'KeyF': Face.F,
      'KeyB': Face.B
    };

    if (faceMap[key]) {
      const face = faceMap[key];
      
      // 방향 결정
      // Shift 또는 소문자(CapsLock off) = 반시계방향
      let direction: 1 | -1 = 1;
      
      // Stewart Smith 스타일: 소문자는 반시계방향
      const isLowerCase = !event.getModifierState('CapsLock') && !modifiers.shift;
      
      if (modifiers.shift || isLowerCase) {
        direction = -1;
      }
      
      // 2 키와 함께 누르면 180도 회전
      const angle = modifiers.alt ? 180 : 90; // Alt를 임시로 180도 회전으로 사용
      
      rotateFace(face, direction, angle);
      return;
    }

    // 중간층 회전
    const middleLayerMap: { [key: string]: string } = {
      'KeyM': 'M', // Middle (L과 R 사이)
      'KeyE': 'E', // Equatorial (U와 D 사이)
      'KeyS': 'S'  // Standing (F와 B 사이) - 단, Ctrl/Shift와 함께
    };

    if (middleLayerMap[key] && (key !== 'KeyS' || modifiers.ctrl || modifiers.shift)) {
      const layer = middleLayerMap[key];
      const direction: 1 | -1 = modifiers.shift ? -1 : 1;
      
      // TODO: 중간층 회전 로직 구현
      console.log(`Middle layer ${layer} rotation: ${direction > 0 ? 'CW' : 'CCW'}`);
      return;
    }

    // 큐브 전체 회전
    const cubeRotationMap: { [key: string]: string } = {
      'KeyX': 'x', // R 방향 회전
      'KeyY': 'y', // U 방향 회전
      'KeyZ': 'z'  // F 방향 회전
    };

    if (cubeRotationMap[key] && !modifiers.ctrl) {
      const axis = cubeRotationMap[key];
      const direction: 1 | -1 = modifiers.shift ? -1 : 1;
      
      // TODO: 큐브 전체 회전 로직 구현
      console.log(`Cube rotation ${axis}: ${direction > 0 ? 'CW' : 'CCW'}`);
      return;
    }
  }, [
    isAnimating, isRunning, isPriming, 
    rotateFace, scramble, reset,
    start, stop, resetTimer, prime, unprime,
    undo, redo, canUndo, canRedo
  ]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && isPriming) {
      unprime();
    }
  }, [isPriming, unprime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    // 수동 제어 함수들 (UI에서 사용)
    rotateFace: (face: Face, direction: 1 | -1, angle?: number) => {
      if (!isAnimating) {
        rotateFace(face, direction, angle);
      }
    },
    scramble: () => {
      if (!isAnimating) {
        scramble();
      }
    },
    reset: () => {
      reset();
      resetTimer();
    },
    undo: () => {
      if (canUndo() && !isAnimating) {
        const undoMove = undo();
        if (undoMove) {
          rotateFace(undoMove.face, undoMove.direction, undoMove.angle);
        }
      }
    },
    redo: () => {
      if (canRedo() && !isAnimating) {
        const redoMove = redo();
        if (redoMove) {
          rotateFace(redoMove.face, redoMove.direction, redoMove.angle);
        }
      }
    }
  };
}