import React, { useState, useEffect, useRef } from 'react'
import { formatTime } from '../../lib/rankingService'
import { localStorageService, supabaseService } from '../../lib/rankingService'

interface NicknameInputModalProps {
  isOpen: boolean
  completionTime: number // 완료 시간 (초 단위)
  onClose: () => void
  onRecordSaved?: (success: boolean) => void
}

export function NicknameInputModal({
  isOpen,
  completionTime,
  onClose,
  onRecordSaved
}: NicknameInputModalProps) {
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 모달이 열릴 때 포커스 설정
  useEffect(() => {
    if (isOpen) {
      setNickname('')
      setError(null)
      setSuccess(false)
      setIsLoading(false)

      // 약간의 지연 후 포커스 설정 (애니메이션 완료 후)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  // 닉네임 검증
  const validateNickname = (name: string): string | null => {
    if (!name.trim()) {
      return '닉네임을 입력해주세요.'
    }
    if (name.trim().length < 2) {
      return '닉네임은 2글자 이상 입력해주세요.'
    }
    if (name.trim().length > 20) {
      return '닉네임은 20글자 이하로 입력해주세요.'
    }
    if (!/^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s_-]+$/.test(name.trim())) {
      return '닉네임에는 특수문자를 사용할 수 없습니다.'
    }
    return null
  }

  // 기록 저장
  const handleSave = async () => {
    const trimmedNickname = nickname.trim()
    const validationError = validateNickname(trimmedNickname)

    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const record = {
        nickname: trimmedNickname,
        time_seconds: completionTime
      }

      // 로컬 스토리지에 저장 (항상 성공)
      localStorageService.saveMyRecord(record)

      // Supabase에 저장 시도
      const supabaseSuccess = await supabaseService.saveRecord(record)

      if (supabaseSuccess) {
        setSuccess(true)
        setTimeout(() => {
          onRecordSaved?.(true)
          handleClose()
        }, 1500)
      } else {
        // Supabase 저장 실패해도 로컬에는 저장됨
        setError('온라인 랭킹 저장에 실패했지만, 내 기록에는 저장되었습니다.')
        setTimeout(() => {
          onRecordSaved?.(false)
          handleClose()
        }, 2000)
      }
    } catch (err) {
      console.error('Error saving record:', err)
      setError('기록 저장 중 오류가 발생했습니다.')
      onRecordSaved?.(false)
    } finally {
      setIsLoading(false)
    }
  }

  // 모달 닫기
  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null

  return (
    <div className="nickname-modal-overlay" onClick={handleClose}>
      <div className="nickname-modal" onClick={e => e.stopPropagation()}>
        <div className="nickname-modal-content">
          <div className="completion-info">
            <div className="completion-emoji">🎉</div>
            <h2 className="completion-title">큐브 완성!</h2>
            <div className="completion-time">{formatTime(completionTime)}</div>
            <p className="completion-subtitle">
              기록을 랭킹에 등록하시겠습니까?
            </p>
          </div>

          <div className="nickname-input-section">
            <label htmlFor="nickname-input" className="nickname-label">
              닉네임
            </label>
            <input
              ref={inputRef}
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="닉네임을 입력하세요 (2-20글자)"
              className="nickname-input"
              maxLength={20}
              disabled={isLoading}
            />
            {error && (
              <div className="nickname-error">{error}</div>
            )}
            {success && (
              <div className="nickname-success">
                ✅ 기록이 성공적으로 저장되었습니다!
              </div>
            )}
          </div>

          <div className="nickname-modal-buttons">
            <button
              className="nickname-modal-button skip"
              onClick={handleClose}
              disabled={isLoading}
            >
              건너뛰기
            </button>
            <button
              className="nickname-modal-button save"
              onClick={handleSave}
              disabled={isLoading || !nickname.trim()}
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>

          <div className="nickname-modal-note">
            <small>
              ⚠️ 기록은 내 기록과 전체 랭킹에 모두 저장됩니다.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}