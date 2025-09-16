import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CAMERA_GRID } from '../constants/cameraLayout'

interface CameraMinimapProps {
  currentCamera: string
  onCameraSelect?: (cameraId: string) => void
  animationSpeed?: number
  onSpeedChange?: (speed: number) => void
  onZoomChange?: (zoom: number) => void
  zoomLevel?: number
}

function MinimapScene({ currentCamera }: { currentCamera: string }) {
  return (
    <>
      {/* Static mini cube at center - same orientation as main cube */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#4fc3f7" opacity={0.8} transparent />
      </mesh>
      
      {/* Camera positions */}
      {Object.values(CAMERA_GRID).map((camera) => {
        const isCurrent = camera.id === currentCamera
        const scale = isCurrent ? 0.15 : 0.08
        
        // 색상: 상단은 밝은 색, 하단은 어두운 색, 현재는 빨간색
        const color = isCurrent ? '#ff4444' : 
                     camera.level === 'upper' ? '#4fc3f7' : '#2196f3'
        
        // Scale down positions for minimap
        const scaledPosition = camera.position.map(p => p * 0.15) as [number, number, number]
        
        return (
          <group key={camera.id}>
            {/* Camera dot */}
            <mesh position={scaledPosition}>
              <sphereGeometry args={[scale, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
            
            {/* Line to center for current camera */}
            {isCurrent && (
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([
                      ...scaledPosition,
                      0, 0, 0
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#ff4444" opacity={0.6} transparent />
              </line>
            )}
            
            {/* Level indicator */}
            <mesh position={[scaledPosition[0], scaledPosition[1] + (camera.level === 'upper' ? 0.2 : -0.2), scaledPosition[2]]}>
              <sphereGeometry args={[0.03, 4, 4]} />
              <meshBasicMaterial color={camera.level === 'upper' ? '#ffffff' : '#666666'} />
            </mesh>
          </group>
        )
      })}
      
      {/* Coordinate axes */}
      <group>
        {/* X axis - red */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-1, 0, 0, 1, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff0000" opacity={0.5} transparent />
        </line>
        
        {/* Y axis - green */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, -1, 0, 0, 1, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff00" opacity={0.5} transparent />
        </line>
        
        {/* Z axis - blue */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, -1, 0, 0, 1])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#0000ff" opacity={0.5} transparent />
        </line>
      </group>
    </>
  )
}

export function CameraMinimap({ currentCamera, animationSpeed = 1, onSpeedChange, onZoomChange, zoomLevel = 1 }: CameraMinimapProps) {
  const [isVisible, setIsVisible] = useState(true)
  const currentCameraInfo = CAMERA_GRID[currentCamera]

  const handleZoomChange = useCallback((newZoom: number) => {
    onZoomChange?.(newZoom)
  }, [onZoomChange])

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  if (!isVisible) {
    return (
      <button
        className="camera-toggle-btn"
        onClick={toggleVisibility}
        title="카메라 패널 열기"
      >
        📹
      </button>
    )
  }

  return (
    <div className="camera-minimap">
      <div className="minimap-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>📹 Camera View</h4>
          <button
            className="camera-close-btn"
            onClick={toggleVisibility}
            title="카메라 패널 닫기"
          >
            ✕
          </button>
        </div>
        <div className="camera-info">
          <div className="camera-name">{currentCameraInfo?.name || 'Unknown'}</div>
          <div className="camera-type">{currentCameraInfo?.type || ''}</div>
        </div>
      </div>
      
      <div className="minimap-canvas">
        <Canvas
          camera={{ 
            position: [2, 2, 2], 
            fov: 50,
            near: 0.1,
            far: 10
          }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
          dpr={Math.min(window.devicePixelRatio, 2)}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[2, 2, 2]} intensity={0.4} />
          <MinimapScene currentCamera={currentCamera} />
        </Canvas>
      </div>
      
      <div className="minimap-legend">
        <div className="legend-item">
          <div className="legend-dot upper"></div>
          <span>Upper</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot lower"></div>
          <span>Lower</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot current"></div>
          <span>Current</span>
        </div>
      </div>
      
      <div className="navigation-help">
        <div className="nav-text">Corner Navigation:</div>
        <div className="nav-keys">
          <div className="key-row">
            <span className="nav-key">↑</span>
            <span className="nav-desc">Opposite Corner</span>
          </div>
          <div className="key-row">
            <span className="nav-key">←</span>
            <span className="nav-desc">Prev Corner</span>
            <span className="nav-key">→</span>
            <span className="nav-desc">Next Corner</span>
          </div>
          <div className="key-row">
            <span className="nav-key">↓</span>
            <span className="nav-desc">Toggle Level</span>
          </div>
        </div>
      </div>


      {/* Animation Speed Control */}
      {onSpeedChange && (
        <div className="animation-speed-control">
          <div className="speed-header">
            <span className="speed-label">⚡ Animation Speed</span>
            <span className="speed-value">{Math.round(animationSpeed * 1000)}ms</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="speed-slider"
          />
          <div className="speed-labels">
            <span>100ms</span>
            <span>3000ms</span>
          </div>
        </div>
      )}

      {/* Zoom Control - Horizontal Layout */}
      {onZoomChange && (
        <div className="zoom-control-horizontal">
          <div className="zoom-header-horizontal">
            <span className="zoom-label-horizontal">🔍 Zoom</span>
            <span className="zoom-value-horizontal">{Math.round(zoomLevel * 100)}%</span>
          </div>
          <div className="zoom-slider-container-horizontal">
            <button
              onClick={() => handleZoomChange(Math.max(0.5, Math.round((zoomLevel - 0.1) * 10) / 10))}
              className="zoom-btn-horizontal"
            >
              -
            </button>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="zoom-slider-horizontal"
            />
            <button
              onClick={() => handleZoomChange(Math.min(2.0, Math.round((zoomLevel + 0.1) * 10) / 10))}
              className="zoom-btn-horizontal"
            >
              +
            </button>
          </div>
          <div className="zoom-labels-horizontal">
            <span>50%</span>
            <span>200%</span>
          </div>
        </div>
      )}
    </div>
  )
}