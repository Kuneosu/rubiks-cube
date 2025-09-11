import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import Lighting from './Lighting';
import CubeContainer from '../Cube/CubeContainer';
import Timer from '../Timer/Timer';
import ControlPanel from '../Controls/ControlPanel';
import { CAMERA_SETTINGS } from '../../utils/constants';

interface SceneProps {
  children?: React.ReactNode;
}

export default function Scene({ children }: SceneProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* UI 오버레이 */}
      <Timer />
      <ControlPanel />
      
      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        {/* 카메라 설정 */}
        <PerspectiveCamera
          makeDefault
          position={CAMERA_SETTINGS.POSITION as [number, number, number]}
          fov={50}
          near={CAMERA_SETTINGS.NEAR}
          far={CAMERA_SETTINGS.FAR}
        />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={CAMERA_SETTINGS.MIN_DISTANCE}
          maxDistance={CAMERA_SETTINGS.MAX_DISTANCE}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          dampingFactor={0.05}
          enableDamping
        />
        
        {/* 조명 */}
        <Lighting />
        
        {/* 큐브 컨테이너 */}
        <Suspense fallback={null}>
          <CubeContainer />
        </Suspense>
        
        {/* 추가 자식 컴포넌트 */}
        {children}
      </Canvas>
    </div>
  );
}