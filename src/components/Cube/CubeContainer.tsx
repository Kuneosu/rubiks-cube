import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import CubeGroup from './CubeGroup';
import { useCubeStore } from '../../store/cubeStore';
import { useTimerStore } from '../../store/timerStore';
import { useKeyboard } from '../../hooks/useKeyboard';

export default function CubeContainer() {
  const groupRef = useRef<Group>(null);
  
  // 키보드 컨트롤 활성화
  useKeyboard();
  
  // 스토어에서 상태 가져오기
  const { 
    cubelets, 
    isAnimating, 
    isSolved,
    settings 
  } = useCubeStore();
  
  const { 
    isRunning, 
    currentTime,
    startTime 
  } = useTimerStore();
  
  // 타이머 업데이트 (60fps)
  useFrame(() => {
    if (isRunning && startTime) {
      const now = Date.now();
      const elapsed = now - startTime;
      useTimerStore.setState({ currentTime: elapsed });
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 큐브 그룹 */}
      <CubeGroup 
        cubelets={cubelets}
        isAnimating={isAnimating}
        settings={settings}
      />
      
      {/* 해결 완료 시 효과 (추후 구현) */}
      {isSolved() && (
        <group>
          {/* TODO: 축하 효과, 파티클 등 */}
        </group>
      )}
    </group>
  );
}