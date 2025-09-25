import { useEffect, useState } from 'react'
import './styles.css'

interface ModeHintProps {
  isVisible: boolean
  onDismiss: () => void
}

export function ModeHint({ isVisible, onDismiss }: ModeHintProps) {
  const [shouldRender, setShouldRender] = useState(isVisible)

  useEffect(() => {
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
    <div className={`mode-hint ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="hint-content">
        <div className="hint-icon">💡</div>
        <div className="hint-text">
          <div className="hint-title">Tip</div>
          <div className="hint-message">탭을 클릭하여 모드를 변경할 수 있습니다</div>
        </div>
        <button
          className="hint-dismiss-btn"
          onClick={handleDismiss}
          aria-label="힌트 닫기"
        >
          ×
        </button>
      </div>
      <div className="hint-arrow" />
    </div>
  )
}