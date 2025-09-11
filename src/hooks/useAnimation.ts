import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useCubeStore } from '../store/cubeStore';
import { useHistoryStore } from '../store/historyStore';
import { Face, Direction, Move, Cubelet } from '../types/cube.types';
import { 
  rotateCubelets, 
  rotateFaceInState, 
  createRotationMatrix 
} from '../utils/rotationLogic';
import { getCubeletsOnFace } from '../utils/cubeHelpers';

interface AnimationState {
  isAnimating: boolean;
  animatingCubelets: Cubelet[];
  targetRotation: THREE.Quaternion;
  startTime: number;
  duration: number;
}

export function useAnimation() {
  const animationState = useRef<AnimationState>({
    isAnimating: false,
    animatingCubelets: [],
    targetRotation: new THREE.Quaternion(),
    startTime: 0,
    duration: 0
  });

  const { 
    cubelets, 
    cubeState, 
    settings,
    setAnimating 
  } = useCubeStore();
  
  const { addMove } = useHistoryStore();

  // 애니메이션 프레임 업데이트
  useFrame(() => {
    const state = animationState.current;
    
    if (!state.isAnimating) return;
    
    const elapsed = Date.now() - state.startTime;
    const progress = Math.min(elapsed / state.duration, 1);
    
    // 이징 함수 (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    // 큐블렛들의 회전 업데이트
    state.animatingCubelets.forEach(cubelet => {
      const mesh = cubelet as any; // mesh reference
      if (mesh.current) {
        // GSAP 대신 직접 제어
        const rotation = new THREE.Quaternion().slerpQuaternions(
          cubelet.rotation,
          state.targetRotation,
          easedProgress
        );
        mesh.current.quaternion.copy(rotation);
      }
    });
    
    // 애니메이션 완료
    if (progress >= 1) {
      state.isAnimating = false;
      setAnimating(false);
    }
  });

  const animateRotation = useCallback((
    face: Face | string, 
    direction: Direction, 
    angle = 90
  ) => {
    if (animationState.current.isAnimating) return;
    
    // Face enum이 아닌 경우 (M, E, S, x, y, z) 처리
    if (typeof face === 'string' && !Object.values(Face).includes(face as Face)) {
      console.log(`Special rotation: ${face} ${direction > 0 ? 'CW' : 'CCW'}`);
      return;
    }
    
    const faceEnum = face as Face;
    const move: Move = { face: faceEnum, direction, angle };
    
    // 히스토리에 추가
    addMove(move);
    
    // 애니메이션할 큐블렛들 찾기
    const animatingCubelets = getCubeletsOnFace(cubelets, faceEnum);
    
    // 회전 행렬 생성
    const rotationMatrix = createRotationMatrix(faceEnum, direction, angle);
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
    
    // 애니메이션 상태 설정
    animationState.current = {
      isAnimating: true,
      animatingCubelets,
      targetRotation: targetQuaternion,
      startTime: Date.now(),
      duration: settings.animationDuration
    };
    
    setAnimating(true);
    
    // GSAP을 사용한 대체 애니메이션 (더 부드러운 제어)
    const timeline = gsap.timeline({
      duration: settings.animationDuration / 1000,
      ease: "power2.out",
      onComplete: () => {
        // 애니메이션 완료 후 실제 상태 업데이트
        const newCubelets = rotateCubelets(cubelets, faceEnum, direction, angle);
        const newCubeState = rotateFaceInState(cubeState, faceEnum, direction, angle);
        
        useCubeStore.setState({
          cubelets: newCubelets,
          cubeState: newCubeState,
          isAnimating: false
        });
        
        animationState.current.isAnimating = false;
      }
    });
    
    // 각 큐블렛에 대해 개별 애니메이션
    animatingCubelets.forEach(cubelet => {
      const mesh = (cubelet as any).meshRef; // mesh reference 가정
      if (mesh?.current) {
        const startQuaternion = cubelet.rotation.clone();
        const endQuaternion = startQuaternion.clone().multiply(targetQuaternion);
        
        timeline.to(mesh.current.quaternion, {
          x: endQuaternion.x,
          y: endQuaternion.y,
          z: endQuaternion.z,
          w: endQuaternion.w,
          duration: settings.animationDuration / 1000
        }, 0);
      }
    });
    
  }, [cubelets, cubeState, settings.animationDuration, setAnimating, addMove]);

  return {
    animateRotation,
    isAnimating: animationState.current.isAnimating
  };
}