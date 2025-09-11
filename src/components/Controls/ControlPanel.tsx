import { useKeyboard } from '../../hooks/useKeyboard';
import { useCubeStore } from '../../store/cubeStore';
import { useHistoryStore } from '../../store/historyStore';
import { Face } from '../../types/cube.types';

export default function ControlPanel() {
  const { rotateFace, scramble, reset } = useKeyboard();
  const { isAnimating } = useCubeStore();
  const { canUndo, canRedo, undo, redo, getHistoryString } = useHistoryStore();

  const buttonStyle = {
    padding: '8px 16px',
    margin: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const disabledStyle = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  };

  const handleRotation = (face: Face, direction: 1 | -1) => {
    if (!isAnimating) {
      rotateFace(face, direction);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000
    }}>
      {/* 면 회전 컨트롤 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        maxWidth: '300px'
      }}>
        <div style={{ textAlign: 'center', fontSize: '12px', gridColumn: '1 / -1', marginBottom: '8px' }}>
          면 회전 (클릭: 시계방향, Shift+클릭: 반시계방향)
        </div>
        
        {(['U', 'R', 'F', 'D', 'L', 'B'] as const).map(faceName => {
          const face = Face[faceName];
          return (
            <button
              key={faceName}
              style={isAnimating ? disabledStyle : buttonStyle}
              disabled={isAnimating}
              onClick={(e) => {
                const direction = e.shiftKey ? -1 : 1;
                handleRotation(face, direction);
              }}
              onMouseEnter={(e) => {
                if (!isAnimating) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {faceName}
            </button>
          );
        })}
      </div>

      {/* 메인 컨트롤 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          style={isAnimating ? disabledStyle : buttonStyle}
          disabled={isAnimating}
          onClick={scramble}
        >
          스크램블 (S)
        </button>
        
        <button
          style={buttonStyle}
          onClick={reset}
        >
          리셋 (Esc)
        </button>
        
        <button
          style={!canUndo() || isAnimating ? disabledStyle : buttonStyle}
          disabled={!canUndo() || isAnimating}
          onClick={undo}
        >
          실행취소 (Ctrl+Z)
        </button>
        
        <button
          style={!canRedo() || isAnimating ? disabledStyle : buttonStyle}
          disabled={!canRedo() || isAnimating}
          onClick={redo}
        >
          재실행 (Ctrl+Y)
        </button>
      </div>

      {/* 키보드 단축키 안내 */}
      <div style={{
        fontSize: '11px',
        opacity: 0.7,
        maxWidth: '400px'
      }}>
        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>키보드 단축키:</div>
        <div>R/L/U/D/F/B: 면 회전 | Shift+면: 반시계방향 | S: 스크램블 | Esc: 리셋</div>
        <div>Space: 타이머 | Ctrl+Z: 실행취소 | Ctrl+Y: 재실행</div>
      </div>

      {/* 히스토리 */}
      {getHistoryString() && (
        <div style={{
          fontSize: '12px',
          opacity: 0.8,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '8px',
          borderRadius: '4px',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>이동 기록:</div>
          <div style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
            {getHistoryString()}
          </div>
        </div>
      )}
    </div>
  );
}