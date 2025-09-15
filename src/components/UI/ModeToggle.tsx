import './styles.css'

interface ModeToggleProps {
  isSpeedcubingMode: boolean
  onToggle: (mode: boolean) => void
}

export function ModeToggle({ isSpeedcubingMode, onToggle }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <div className="mode-toggle-container">
        <button
          className={`mode-button ${!isSpeedcubingMode ? 'active' : ''}`}
          onClick={() => onToggle(false)}
        >
          🧩 Cube Mode
        </button>
        <button
          className={`mode-button ${isSpeedcubingMode ? 'active' : ''}`}
          onClick={() => onToggle(true)}
        >
          ⏱️ Speedcubing
        </button>
      </div>
    </div>
  )
}