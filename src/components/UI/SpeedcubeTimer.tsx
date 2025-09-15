import { TimerState } from '../../hooks/useSpeedcubeTimer'
import './styles.css'

interface SpeedcubeTimerProps {
  timerState: TimerState
  currentTime: number
  formatTime: (time: number) => string
  isCubeLocked?: boolean
}

export function SpeedcubeTimer({
  timerState,
  currentTime,
  formatTime,
  isCubeLocked
}: SpeedcubeTimerProps) {
  
  const getTimerColor = () => {
    switch (timerState) {
      case 'idle':
        return '#ffffff'
      case 'preparing':
        return '#ff6b6b' // Red while preparing
      case 'ready':
        return '#51cf66' // Green when ready
      case 'running':
        return '#339af0' // Blue while running
      case 'stopped':
        return '#ffd43b' // Yellow when stopped
      default:
        return '#ffffff'
    }
  }

  const getDisplayTime = () => {
    if (timerState === 'idle' || timerState === 'preparing') {
      return '0.00'
    }
    if (timerState === 'ready') {
      return 'READY'
    }
    return formatTime(currentTime)
  }

  const getTimerText = () => {
    switch (timerState) {
      case 'idle':
        return isCubeLocked ? '🔒 Cube is locked - Hold SPACE to start' : 'Hold SPACE to start'
      case 'preparing':
        return 'Keep holding...'
      case 'ready':
        return 'Release to start!'
      case 'running':
        return 'Press SPACE when solved'
      case 'stopped':
        return 'Solved!'
      default:
        return ''
    }
  }

  return (
    <div className="speedcube-timer">
      <div
        className={`timer-display ${timerState}`}
        style={{ color: getTimerColor() }}
      >
        {getDisplayTime()}
      </div>
      <div className="timer-status">
        {getTimerText()}
      </div>
    </div>
  )
}