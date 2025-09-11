import { useRef, useMemo } from 'react';
import { Mesh, BoxGeometry, MeshPhysicalMaterial } from 'three';
// RoundedBoxGeometry import 주석 처리 (일단 BoxGeometry 사용)
// import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { Cubelet as CubeletType } from '../../types/cube.types';
import { getThreeColor } from '../../utils/cubeHelpers';
import { CUBELET_SIZE, CORNER_RADIUS, COLORS } from '../../utils/constants';

interface CubeletProps {
  cubelet: CubeletType;
  position: [number, number, number];
  isAnimating: boolean;
  showWireframe?: boolean;
  enableShadows?: boolean;
}

export default function Cubelet({ 
  cubelet, 
  position, 
  isAnimating, 
  showWireframe = false,
  enableShadows = true 
}: CubeletProps) {
  const meshRef = useRef<Mesh>(null);
  
  // 지오메트리 캐싱 (성능 최적화) - 일단 BoxGeometry 사용
  const geometry = useMemo(() => {
    return new BoxGeometry(
      CUBELET_SIZE, 
      CUBELET_SIZE, 
      CUBELET_SIZE
    );
  }, []);
  
  // 머티리얼 생성 (PBR - Physically Based Rendering)
  const materials = useMemo(() => {
    // 큐블렛의 visible faces만 해당 색상으로, 나머지는 검은색
    const faceMaterials = [];
    
    // 6면 순서: +X, -X, +Y, -Y, +Z, -Z (Three.js 기본 순서)
    const faceOrder = ['right', 'left', 'top', 'bottom', 'front', 'back'];
    
    for (let i = 0; i < 6; i++) {
      const faceColor = cubelet.faces.find(face => {
        // Three.js 면 순서에 맞춰 매핑
        switch (i) {
          case 0: return cubelet.position.x === 1; // +X (right)
          case 1: return cubelet.position.x === -1; // -X (left)
          case 2: return cubelet.position.y === 1; // +Y (top)
          case 3: return cubelet.position.y === -1; // -Y (bottom)
          case 4: return cubelet.position.z === 1; // +Z (front)
          case 5: return cubelet.position.z === -1; // -Z (back)
          default: return false;
        }
      });
      
      const color = faceColor ? COLORS[faceColor.color] : 0x1a1a1a; // 검은색
      
      faceMaterials.push(
        new MeshPhysicalMaterial({
          color,
          roughness: 0.1,
          metalness: 0.0,
          clearcoat: 0.1,
          clearcoatRoughness: 0.1,
          wireframe: showWireframe
        })
      );
    }
    
    return faceMaterials;
  }, [cubelet.faces, cubelet.position, showWireframe]);
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      quaternion={cubelet.rotation}
      geometry={geometry}
      material={materials}
      castShadow={enableShadows}
      receiveShadow={enableShadows}
    />
  );
}