import { supabase, SpeedCubeRecord, LOCAL_STORAGE_KEYS } from './supabase'

// Local Storage 관련 함수들
export const localStorageService = {
  // 내 기록 저장
  saveMyRecord: (record: Omit<SpeedCubeRecord, 'id' | 'created_at'>): void => {
    try {
      const existingRecords = localStorageService.getMyRecords()
      const newRecord: SpeedCubeRecord = {
        ...record,
        id: Date.now(), // 로컬용 고유 ID
        created_at: new Date().toISOString()
      }

      const updatedRecords = [...existingRecords, newRecord]
        .sort((a, b) => a.time_seconds - b.time_seconds) // 시간순 정렬
        .slice(0, 100) // 최대 100개 기록만 보관

      localStorage.setItem(LOCAL_STORAGE_KEYS.MY_RECORDS, JSON.stringify(updatedRecords))
    } catch (error) {
      console.error('Failed to save record to localStorage:', error)
    }
  },

  // 내 기록 조회
  getMyRecords: (): SpeedCubeRecord[] => {
    try {
      const records = localStorage.getItem(LOCAL_STORAGE_KEYS.MY_RECORDS)
      return records ? JSON.parse(records) : []
    } catch (error) {
      console.error('Failed to get records from localStorage:', error)
      return []
    }
  },

  // 내 최고 기록
  getMyBestTime: (): number | null => {
    const records = localStorageService.getMyRecords()
    return records.length > 0 ? records[0].time_seconds : null
  }
}

// Supabase 관련 함수들
export const supabaseService = {
  // 전체 랭킹 조회 (상위 100개)
  getAllRankings: async (): Promise<SpeedCubeRecord[]> => {
    if (!supabase) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('speedcube_records')
        .select('*')
        .order('time_seconds', { ascending: true })
        .limit(100)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch rankings:', error)
      return []
    }
  },

  // 새 기록 저장
  saveRecord: async (record: Omit<SpeedCubeRecord, 'id' | 'created_at'>): Promise<boolean> => {
    if (!supabase) {
      console.warn('Supabase not configured')
      return false
    }

    try {
      const { error } = await supabase
        .from('speedcube_records')
        .insert({
          ...record,
          ip_address: null, // IP는 서버에서 자동 처리하도록
          user_agent: navigator.userAgent
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to save record to Supabase:', error)
      return false
    }
  },

  // 특정 시간보다 빠른 기록 수 조회 (순위 계산용)
  getRankByTime: async (timeSeconds: number): Promise<number> => {
    if (!supabase) return 0

    try {
      const { count, error } = await supabase
        .from('speedcube_records')
        .select('*', { count: 'exact', head: true })
        .lt('time_seconds', timeSeconds)

      if (error) throw error
      return (count || 0) + 1 // 순위는 1부터 시작
    } catch (error) {
      console.error('Failed to get rank:', error)
      return 0
    }
  }
}

// 시간 포맷팅 유틸리티
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = (seconds % 60).toFixed(3)

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`
  }
  return `${remainingSeconds}s`
}

// 순위 표시 유틸리티
export const formatRank = (rank: number): string => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}