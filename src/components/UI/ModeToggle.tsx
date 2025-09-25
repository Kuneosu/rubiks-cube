import './styles.css'

interface ModeToggleProps {
  isSpeedcubingMode: boolean
  onToggle: (mode: boolean) => void
}

export function ModeToggle({ isSpeedcubingMode, onToggle }: ModeToggleProps) {
  const handleToggle = (mode: boolean) => {
    onToggle(mode)
  }

  return (
    <div className="mode-toggle-section">
      <div className="mode-toggle">
        <div className="mode-toggle-container">
          <button
            className={`mode-button ${!isSpeedcubingMode ? 'active' : ''}`}
            onClick={() => handleToggle(false)}
          >
            🧩 Cube Mode
          </button>
          <button
            className={`mode-button ${isSpeedcubingMode ? 'active' : ''}`}
            onClick={() => handleToggle(true)}
          >
            ⏱️ Speedcubing
          </button>
        </div>
      </div>

      {/* Mode change hint text */}
      <div className="mode-hint-text">
        💡 Tab 키로 모드를 변경할 수 있습니다
      </div>
    </div>
  )
}