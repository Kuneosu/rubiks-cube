import { useEffect, useState } from 'react'
import './styles.css'

interface SpeedHintProps {
  isVisible: boolean
  onDismiss: () => void
}

export function SpeedHint({ isVisible, onDismiss }: SpeedHintProps) {
  const [shouldRender, setShouldRender] = useState(isVisible)

  useEffect(() => {
    console.log('SpeedHint visibility change:', isVisible)
    if (isVisible) {
      setShouldRender(true)
    } else {
      // 애니메이션 완료 후 DOM에서 제거
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const handleDismiss = () => {
    onDismiss()
  }

  if (!shouldRender) return null

  return (
    <div className={`speed-hint ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="speed-hint-content">
        <div className="speed-hint-icon">⚡</div>
        <div className="speed-hint-text">
          <div className="speed-hint-title">Pro Tip</div>
          <div className="speed-hint-message">애니메이션 속도를 낮추면 더 빠르게 조작할 수 있습니다</div>
        </div>
        <button
          className="speed-hint-dismiss-btn"
          onClick={handleDismiss}
          aria-label="힌트 닫기"
        >
          ×
        </button>
      </div>
      <div className="speed-hint-arrow" />
    </div>
  )
}