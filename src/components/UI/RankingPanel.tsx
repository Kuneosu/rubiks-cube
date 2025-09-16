import { useState, useEffect } from 'react'
import { formatTime, formatRank } from '../../lib/rankingService'
import type { SpeedCubeRecord } from '../../lib/supabase'
import { localStorageService, supabaseService } from '../../lib/rankingService'

interface MyRecordWithRank extends SpeedCubeRecord {
  globalRank?: number
}

interface RankingPanelProps {
  isVisible?: boolean
  onToggleVisibility?: () => void
}

export function RankingPanel({ isVisible = true, onToggleVisibility }: RankingPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [allRecords, setAllRecords] = useState<SpeedCubeRecord[]>([])
  const [myRecords, setMyRecords] = useState<MyRecordWithRank[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 전체 랭킹 로드
  const loadAllRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const records = await supabaseService.getAllRankings()
      setAllRecords(records)
    } catch (err) {
      setError('전체 랭킹을 불러오는데 실패했습니다.')
      console.error('Failed to load all records:', err)
    } finally {
      setLoading(false)
    }
  }

  // 내 기록 로드 (전체 순위 포함)
  const loadMyRecords = async () => {
    const records = localStorageService.getMyRecords()

    // 각 기록에 전체 순위 추가
    const recordsWithRank: MyRecordWithRank[] = await Promise.all(
      records.map(async (record) => {
        try {
          const globalRank = await supabaseService.getRankByTime(record.time_seconds)
          return { ...record, globalRank }
        } catch (error) {
          console.error('Failed to get rank for record:', error)
          return { ...record, globalRank: undefined }
        }
      })
    )

    setMyRecords(recordsWithRank)
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadMyRecords()
    if (activeTab === 'all') {
      loadAllRecords()
    }
  }, [])

  // 탭 변경 시 해당 데이터 로드
  useEffect(() => {
    if (activeTab === 'all') {
      loadAllRecords()
    } else {
      loadMyRecords()
    }
  }, [activeTab])

  // 새로고침 함수
  const handleRefresh = () => {
    if (activeTab === 'all') {
      loadAllRecords()
    } else {
      loadMyRecords()
    }
  }

  const currentRecords = activeTab === 'all' ? allRecords : myRecords

  if (!isVisible) {
    return (
      <button
        className="ranking-toggle-btn"
        onClick={onToggleVisibility}
        title="랭킹 패널 열기"
      >
        🏆
      </button>
    )
  }

  return (
    <div className="ranking-panel">
      <div className="ranking-header">
        <div className="ranking-title">
          <span>🏆 랭킹</span>
          <button
            className="ranking-close-btn"
            onClick={onToggleVisibility}
            title="랭킹 패널 닫기"
          >
            ✕
          </button>
        </div>

        {/* 탭 버튼 */}
        <div className="ranking-tabs">
          <button
            className={`ranking-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            전체 (All)
          </button>
          <button
            className={`ranking-tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            내 기록 (My)
          </button>
        </div>

        {/* 새로고침 버튼 */}
        <button
          className="ranking-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          title="새로고침"
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </div>

      <div className="ranking-content">
        {error && (
          <div className="ranking-error">
            {error}
            <button onClick={handleRefresh} className="retry-btn">재시도</button>
          </div>
        )}

        {loading && (
          <div className="ranking-loading">
            기록을 불러오는 중...
          </div>
        )}

        {!loading && !error && currentRecords.length === 0 && (
          <div className="ranking-empty">
            {activeTab === 'all'
              ? '아직 등록된 기록이 없습니다.'
              : '아직 내 기록이 없습니다.\n스피드큐빙을 완료해보세요!'
            }
          </div>
        )}

        {!loading && !error && currentRecords.length > 0 && (
          <div className="ranking-list">
            {currentRecords.map((record, index) => (
              <div key={record.id || index} className="ranking-item">
                <div className="rank">
                  {activeTab === 'my' && 'globalRank' in record && typeof record.globalRank === 'number'
                    ? formatRank(record.globalRank)
                    : formatRank(index + 1)}
                </div>
                <div className="record-info">
                  <div className="nickname">{record.nickname}</div>
                  <div className="time">{formatTime(record.time_seconds)}</div>
                  {record.created_at && (
                    <div className="date">
                      {new Date(record.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 통계 정보 */}
        {!loading && currentRecords.length > 0 && (
          <div className="ranking-stats">
            <div className="stat-item">
              <span className="label">총 기록:</span>
              <span className="value">{currentRecords.length}개</span>
            </div>
            {activeTab === 'my' && myRecords.length > 0 && (
              <div className="stat-item">
                <span className="label">최고 기록:</span>
                <span className="value">{formatTime(myRecords[0].time_seconds)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}