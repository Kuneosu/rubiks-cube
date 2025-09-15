import { createClient } from '@supabase/supabase-js'

// Supabase 환경변수 검증
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Ranking features will be disabled.')
}

// Supabase 클라이언트 생성
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 스피드큐빙 기록 타입 정의
export interface SpeedCubeRecord {
  id?: number
  nickname: string
  time_seconds: number
  created_at?: string
  ip_address?: string
  user_agent?: string
}

// Local Storage 키 상수
export const LOCAL_STORAGE_KEYS = {
  MY_RECORDS: 'speedcube_my_records'
} as const