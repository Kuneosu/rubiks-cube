import { useState } from 'react'

interface KeyGuideProps {
  isVisible?: boolean
  onToggleVisibility?: () => void
}

export function KeyGuide({ isVisible = false, onToggleVisibility }: KeyGuideProps) {
  if (!isVisible) {
    return (
      <button
        className="keyguide-toggle-btn"
        onClick={onToggleVisibility}
        title="키 가이드 열기"
      >
        ⌨️
      </button>
    )
  }

  return (
    <div className="keyguide-panel">
      <div className="keyguide-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>⌨️ Key Guide</h4>
          <button
            className="keyguide-close-btn"
            onClick={onToggleVisibility}
            title="키 가이드 닫기"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="keyguide-content">
        <div className="guide-section">
          <div className="guide-title">🎮 큐브 조작</div>
          <div className="guide-keys">
            <div className="guide-row">
              <span className="guide-key">Q</span>
              <span className="guide-desc">Front 면 회전</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">W</span>
              <span className="guide-desc">Up 면 회전</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">E</span>
              <span className="guide-desc">Back 면 회전</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">A</span>
              <span className="guide-desc">Left 면 회전</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">S</span>
              <span className="guide-desc">Down 면 회전</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">D</span>
              <span className="guide-desc">Right 면 회전</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">↑</span>
              <span className="guide-desc">큐브 90도 회전 (Y축)</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">↓</span>
              <span className="guide-desc">큐브 90도 회전 (Y축 반대)</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">Shift</span>
              <span className="guide-desc">반시계방향 회전</span>
            </div>
          </div>
        </div>

        <div className="guide-section">
          <div className="guide-title">📹 카메라</div>
          <div className="guide-keys">
            <div className="guide-row">
              <span className="guide-key">←</span>
              <span className="guide-desc">이전 코너</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">→</span>
              <span className="guide-desc">다음 코너</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">T</span>
              <span className="guide-desc">Top View</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">B</span>
              <span className="guide-desc">Bottom View</span>
            </div>
          </div>
        </div>

        <div className="guide-section">
          <div className="guide-title">⚡ 시스템</div>
          <div className="guide-keys">
            <div className="guide-row">
              <span className="guide-key">Space</span>
              <span className="guide-desc">타이머 시작/정지</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">Tab</span>
              <span className="guide-desc">모드 전환</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">0</span>
              <span className="guide-desc">큐브 셔플</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">R</span>
              <span className="guide-desc">큐브 리셋</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">Ctrl+Z</span>
              <span className="guide-desc">실행 취소</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">Ctrl+Y</span>
              <span className="guide-desc">다시 실행</span>
            </div>
          </div>
        </div>

        <div className="guide-section">
          <div className="guide-title">🎛️ 조작</div>
          <div className="guide-keys">
            <div className="guide-row">
              <span className="guide-key">,</span>
              <span className="guide-desc">애니메이션 속도 감소</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">.</span>
              <span className="guide-desc">애니메이션 속도 증가</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">Shift+,</span>
              <span className="guide-desc">카메라 줌 축소</span>
            </div>
            <div className="guide-row">
              <span className="guide-key">Shift+.</span>
              <span className="guide-desc">카메라 줌 확대</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}