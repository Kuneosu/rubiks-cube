import { useEffect } from 'react'
import './styles.css'

interface ShuffleConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ShuffleConfirmModal({ isOpen, onConfirm, onCancel }: ShuffleConfirmModalProps) {
  // Handle keyboard shortcuts when modal is open
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault()
        onConfirm()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <div className="shuffle-modal-overlay" onClick={onCancel}>
      <div className="shuffle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shuffle-modal-content">
          <p>큐브를 섞으시겠습니까?</p>

          <div className="shuffle-modal-buttons">
            <button
              className="shuffle-modal-button confirm"
              onClick={onConfirm}
            >
              섞기 (Space)
            </button>
            <button
              className="shuffle-modal-button cancel"
              onClick={onCancel}
            >
              취소 (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}