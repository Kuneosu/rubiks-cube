import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Session, TimerStats } from '../types/cube.types';

interface TimerStore {
  // State
  startTime: number | null;
  currentTime: number;
  isRunning: boolean;
  isPriming: boolean;
  inspectionStartTime: number | null;
  inspectionTime: number;
  sessions: Session[];
  
  // Actions
  start: () => void;
  stop: () => void;
  reset: () => void;
  prime: () => void;
  unprime: () => void;
  startInspection: () => void;
  stopInspection: () => void;
  addSession: (scramble: string, penalty?: 'DNF' | '+2') => void;
  deleteSession: (id: string) => void;
  clearSessions: () => void;
  
  // Getters
  getStats: () => TimerStats;
  getFormattedTime: (time?: number) => string;
  getBestTime: () => number;
  getAverageOf: (count: number) => number;
}

export const useTimerStore = create<TimerStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        startTime: null,
        currentTime: 0,
        isRunning: false,
        isPriming: false,
        inspectionStartTime: null,
        inspectionTime: 0,
        sessions: [],
        
        // Actions
        start: () => {
          const now = Date.now();
          set({
            startTime: now,
            currentTime: 0,
            isRunning: true,
            isPriming: false,
            inspectionStartTime: null,
            inspectionTime: 0
          });
        },
        
        stop: () => {
          const { startTime, isRunning } = get();
          if (!isRunning || !startTime) return;
          
          const endTime = Date.now();
          const finalTime = endTime - startTime;
          
          set({
            currentTime: finalTime,
            isRunning: false,
            startTime: null
          });
          
          return finalTime;
        },
        
        reset: () => {
          set({
            startTime: null,
            currentTime: 0,
            isRunning: false,
            isPriming: false,
            inspectionStartTime: null,
            inspectionTime: 0
          });
        },
        
        prime: () => {
          set({ isPriming: true });
        },
        
        unprime: () => {
          set({ isPriming: false });
        },
        
        startInspection: () => {
          const now = Date.now();
          set({
            inspectionStartTime: now,
            inspectionTime: 0
          });
        },
        
        stopInspection: () => {
          set({
            inspectionStartTime: null,
            inspectionTime: 0
          });
        },
        
        addSession: (scramble: string, penalty?: 'DNF' | '+2') => {
          const { currentTime } = get();
          if (currentTime === 0) return;
          
          const session: Session = {
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            time: currentTime,
            scramble,
            date: new Date(),
            penalty
          };
          
          set(state => ({
            sessions: [...state.sessions, session]
          }));
        },
        
        deleteSession: (id: string) => {
          set(state => ({
            sessions: state.sessions.filter(session => session.id !== id)
          }));
        },
        
        clearSessions: () => {
          set({ sessions: [] });
        },
        
        // Getters
        getStats: (): TimerStats => {
          const { sessions, currentTime } = get();
          
          if (sessions.length === 0) {
            return {
              currentTime,
              bestTime: 0,
              ao5: 0,
              ao12: 0,
              ao100: 0
            };
          }
          
          const validTimes = sessions
            .filter(session => session.penalty !== 'DNF')
            .map(session => {
              const baseTime = session.time;
              return session.penalty === '+2' ? baseTime + 2000 : baseTime;
            })
            .sort((a, b) => a - b);
          
          const bestTime = validTimes.length > 0 ? validTimes[0] : 0;
          
          return {
            currentTime,
            bestTime,
            ao5: get().getAverageOf(5),
            ao12: get().getAverageOf(12),
            ao100: get().getAverageOf(100)
          };
        },
        
        getFormattedTime: (time?: number): string => {
          const targetTime = time ?? get().currentTime;
          const seconds = Math.floor(targetTime / 1000);
          const milliseconds = Math.floor((targetTime % 1000) / 10);
          
          if (seconds >= 60) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
          }
          
          return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
        },
        
        getBestTime: (): number => {
          const { sessions } = get();
          const validTimes = sessions
            .filter(session => session.penalty !== 'DNF')
            .map(session => session.time);
          
          return validTimes.length > 0 ? Math.min(...validTimes) : 0;
        },
        
        getAverageOf: (count: number): number => {
          const { sessions } = get();
          
          if (sessions.length < count) return 0;
          
          const recentSessions = sessions.slice(-count);
          const validTimes = recentSessions
            .filter(session => session.penalty !== 'DNF')
            .map(session => {
              const baseTime = session.time;
              return session.penalty === '+2' ? baseTime + 2000 : baseTime;
            });
          
          if (validTimes.length < count) return 0;
          
          // 상위/하위 5% 제거 (큐빙 표준)
          const trimCount = Math.floor(count * 0.05);
          const sortedTimes = validTimes.sort((a, b) => a - b);
          const trimmedTimes = sortedTimes.slice(trimCount, -trimCount || undefined);
          
          const sum = trimmedTimes.reduce((acc, time) => acc + time, 0);
          return Math.round(sum / trimmedTimes.length);
        }
      }),
      {
        name: 'timer-store',
        partialize: (state) => ({
          sessions: state.sessions
        })
      }
    ),
    {
      name: 'timer-store'
    }
  )
);