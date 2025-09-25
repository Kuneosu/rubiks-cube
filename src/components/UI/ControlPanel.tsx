import { RubiksCubeState, MoveHistory } from '../../types'

interface ControlPanelProps {
  cubeState: RubiksCubeState
  history: MoveHistory
  animationSpeed: number
  currentView: string
  viewIndex: number
  totalViews: number
  onShuffle: () => void
  onReset: () => void
  onUndo: () => void
  onRedo: () => void
  onSpeedChange: (speed: number) => void
  onCameraNext: () => void
  onCameraPrev: () => void
  onCameraJump: (cameraId: string) => void
  onColorSettings: () => void
  onClose: () => void
}

export function ControlPanel({
  cubeState,
  history,
  animationSpeed,
  currentView,
  viewIndex,
  totalViews,
  onShuffle,
  onReset,
  onUndo,
  onRedo,
  onSpeedChange,
  onCameraNext,
  onCameraPrev,
  onCameraJump,
  onColorSettings,
  onClose
}: ControlPanelProps) {
  const isAnimating = cubeState !== 'idle'
  const canUndo = history.currentIndex >= 0
  const canRedo = history.currentIndex < history.moves.length - 1
  
  return (
    <div className="control-panel">
      <div className="panel-header">
        <h3>🎮 RUBIK'S CUBE</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      {/* Status Display */}
      <div className="status-section">
        <div className="status-item">
          <span className="label">Status:</span>
          <span className={`status ${cubeState}`}>
            {cubeState === 'idle' ? '✅ Ready' : 
             cubeState === 'animating' ? '🔄 Animating' : '🎲 Shuffling'}
          </span>
        </div>
        
        <div className="status-item">
          <span className="label">View:</span>
          <span className="view">{currentView.toUpperCase()} ({viewIndex}/{totalViews})</span>
        </div>
        
        <div className="status-item">
          <span className="label">History:</span>
          <span className="history">{history.currentIndex + 1} / {history.moves.length}</span>
        </div>
      </div>
      
      {/* Camera Controls */}
      <div className="camera-section">
        <h4>📷 Camera Views</h4>
        <div className="button-row">
          <button 
            onClick={onCameraPrev} 
            disabled={isAnimating}
            className="action-btn camera-nav"
          >
            ← Prev
          </button>
          
          <button 
            onClick={onCameraNext} 
            disabled={isAnimating}
            className="action-btn camera-nav"
          >
            Next →
          </button>
        </div>
        
        <div className="quick-views">
          {['front', 'back', 'right', 'left', 'top', 'bottom'].map(view => (
            <button
              key={view}
              onClick={() => onCameraJump(view)}
              disabled={isAnimating}
              className={`quick-view-btn ${currentView.toLowerCase().includes(view) ? 'active' : ''}`}
            >
              {view.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Controls */}
      <div className="controls-section">
        <div className="button-row">
          <button
            onClick={onShuffle}
            disabled={isAnimating}
            className="action-btn shuffle"
          >
            🎲 Shuffle
          </button>

          <button
            onClick={onReset}
            disabled={isAnimating}
            className="action-btn reset"
          >
            🔄 Reset
          </button>
        </div>

        <div className="button-row">
          <button
            onClick={onUndo}
            disabled={isAnimating || !canUndo}
            className="action-btn undo"
          >
            ↶ Undo
          </button>

          <button
            onClick={onRedo}
            disabled={isAnimating || !canRedo}
            className="action-btn redo"
          >
            ↷ Redo
          </button>
        </div>

        <div className="button-row">
          <button
            onClick={onColorSettings}
            disabled={isAnimating}
            className="action-btn color-settings"
          >
            🎨 색상 설정
          </button>
        </div>
      </div>
      
      {/* Animation Speed */}
      <div className="speed-section">
        <label className="speed-label">
          Animation Speed: {Math.round((1 / animationSpeed) * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="speed-slider"
        />
      </div>
      
      {/* Instructions */}
      <div className="instructions-section">
        <h4>🎯 Controls</h4>
        <div className="instructions-grid">
          <div className="instruction-group">
            <strong>Cube Rotation:</strong>
            <div className="key-map">
              <span className="key">W</span> Up face
              <span className="key">S</span> Down face
              <span className="key">A</span> Left face
              <span className="key">D</span> Right face
              <span className="key">Q</span> Front face
              <span className="key">E</span> Back face
            </div>
            <small>Hold Shift for reverse rotation</small>
          </div>
          
          <div className="instruction-group">
            <strong>Camera Views:</strong>
            <div className="key-map">
              <span className="key">1-6</span> Face views
              <span className="key">0</span> Isometric
              <span className="key">←→</span> Navigate views
            </div>
          </div>
          
          <div className="instruction-group">
            <strong>Quick Actions:</strong>
            <div className="key-map">
              <span className="key">Space</span> Shuffle
              <span className="key">R</span> Reset
              <span className="key">Ctrl+Z</span> Undo
              <span className="key">Ctrl+Y</span> Redo
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Moves */}
      {history.moves.length > 0 && (
        <div className="moves-section">
          <h4>📝 Recent Moves</h4>
          <div className="moves-list">
            {history.moves.slice(Math.max(0, history.currentIndex - 4), history.currentIndex + 1).map((move, index) => (
              <span key={index} className={`move ${index === history.moves.slice(Math.max(0, history.currentIndex - 4), history.currentIndex + 1).length - 1 ? 'current' : ''}`}>
                {move}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}