import { useRef } from 'react';
import { Group } from 'three';
import Cubelet from './Cubelet';
import { Cubelet as CubeletType, CubeSettings } from '../../types/cube.types';
import { positionToCoordinates } from '../../utils/cubeHelpers';
import { CUBELET_SIZE } from '../../utils/constants';

interface CubeGroupProps {
  cubelets: CubeletType[];
  isAnimating: boolean;
  settings: CubeSettings;
}

export default function CubeGroup({ cubelets, isAnimating, settings }: CubeGroupProps) {
  const groupRef = useRef<Group>(null);
  
  return (
    <group 
      ref={groupRef}
      position={[0, 0, 0]}
    >
      {cubelets.map((cubelet) => {
        const [x, y, z] = positionToCoordinates(cubelet.position);
        const spacing = CUBELET_SIZE + settings.cubeletGap;
        
        return (
          <Cubelet
            key={cubelet.id}
            cubelet={cubelet}
            position={[x * spacing, y * spacing, z * spacing]}
            isAnimating={isAnimating}
            showWireframe={settings.showWireframe}
            enableShadows={settings.enableShadows}
          />
        );
      })}
    </group>
  );
}