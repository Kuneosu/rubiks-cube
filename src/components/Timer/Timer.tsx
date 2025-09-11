import { useEffect } from 'react';
import { useTimerStore } from '../../store/timerStore';

export default function Timer() {
  const { 
    currentTime, 
    isRunning, 
    isPriming,
    getFormattedTime,
    getStats
  } = useTimerStore();

  const stats = getStats();

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: 'white',
      fontFamily: 'Monaco, Consolas, monospace',
      fontSize: '24px',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      userSelect: 'none',
      zIndex: 1000
    }}>
      {/* 메인 타이머 */}
      <div style={{
        fontSize: isPriming ? '36px' : '48px',
        color: isPriming ? '#ffeb3b' : isRunning ? '#4caf50' : '#ffffff',
        marginBottom: '10px',
        transition: 'all 0.2s ease'
      }}>
        {getFormattedTime()}
      </div>
      
      {/* 통계 */}
      {!isRunning && (
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          {stats.bestTime > 0 && (
            <div>Best: {getFormattedTime(stats.bestTime)}</div>
          )}
          {stats.ao5 > 0 && (
            <div>Ao5: {getFormattedTime(stats.ao5)}</div>
          )}
          {stats.ao12 > 0 && (
            <div>Ao12: {getFormattedTime(stats.ao12)}</div>
          )}
        </div>
      )}
      
      {/* 상태 표시 */}
      <div style={{ 
        fontSize: '12px', 
        opacity: 0.6,
        marginTop: '8px'
      }}>
        {isPriming && 'Space를 놓으면 시작'}
        {isRunning && 'Space로 정지'}
        {!isPriming && !isRunning && 'Space를 누르고 있으면 준비'}
      </div>
    </div>
  );
}