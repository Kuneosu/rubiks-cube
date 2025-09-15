import { useState, useRef, useCallback, useEffect } from 'react'
import { formatTime } from '../utils/constants'

export type TimerState = 'idle' | 'preparing' | 'ready' | 'running' | 'stopped'

export interface TimerRecord {
  id: string
  time: number
  date: Date
  moves: string[]
}

/**
 * Hook for managing speedcube timer functionality
 */
export function useSpeedcubeTimer(resetCube?: () => void) {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [records, setRecords] = useState<TimerRecord[]>([])
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isCubeLocked, setIsCubeLocked] = useState(false)
  
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const prepareTimeoutRef = useRef<number | null>(null)
  const currentMovesRef = useRef<string[]>([])

  // Update current time while timer is running
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setCurrentTime(Date.now() - startTimeRef.current)
        }
      }, 10) // Update every 10ms for precision
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState])

  const startPreparing = useCallback(() => {
    if (timerState !== 'idle' && timerState !== 'stopped') return false

    // If starting from 'stopped' state, reset time for new solve
    if (timerState === 'stopped') {
      setCurrentTime(0)
    }

    setTimerState('preparing')
    setIsSpacePressed(true)
    setIsCubeLocked(true) // Lock cube when preparing

    // After 500ms of holding spacebar, timer becomes ready
    prepareTimeoutRef.current = setTimeout(() => {
      setTimerState('ready')
    }, 500)

    return true
  }, [timerState])

  const cancelPreparing = useCallback(() => {
    if (prepareTimeoutRef.current) {
      clearTimeout(prepareTimeoutRef.current)
      prepareTimeoutRef.current = null
    }
    
    if (timerState === 'preparing') {
      setTimerState('idle')
      setIsCubeLocked(false) // Unlock cube when cancelling
    } else if (timerState === 'ready') {
      // Start timer when spacebar is released from ready state
      setTimerState('running')
      startTimeRef.current = Date.now()
      setCurrentTime(0)
      currentMovesRef.current = []
      setIsCubeLocked(false) // Unlock cube when timer starts
    }
    
    setIsSpacePressed(false)
  }, [timerState])

  const stopTimer = useCallback((solved: boolean, moveHistory: string[]) => {
    if (timerState !== 'running') return false

    const finalTime = Date.now() - (startTimeRef.current || 0)
    setCurrentTime(finalTime)
    setTimerState('stopped')
    setIsCubeLocked(true) // Lock cube after timer stops

    if (solved) {
      // Create new record
      const record: TimerRecord = {
        id: Date.now().toString(),
        time: finalTime,
        date: new Date(),
        moves: [...moveHistory]
      }

      setRecords(prev => [record, ...prev].slice(0, 100)) // Keep last 100 records

      // Stay in 'stopped' state and keep the time displayed
      // Don't automatically reset - wait for user to start new solve

      return true
    }

    // If not solved, continue timer
    setTimerState('running')
    return false
  }, [timerState])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (prepareTimeoutRef.current) {
      clearTimeout(prepareTimeoutRef.current)
    }
    
    setTimerState('idle')
    setCurrentTime(0)
    setIsSpacePressed(false)
    setIsCubeLocked(false)
    startTimeRef.current = null
    currentMovesRef.current = []
  }, [])

  const addMove = useCallback((move: string) => {
    if (timerState === 'running') {
      currentMovesRef.current.push(move)
    }
  }, [timerState])


  // Function to lock cube (called when cube is shuffled)
  const lockCube = useCallback(() => {
    setIsCubeLocked(true)
  }, [])

  // Function to handle speedcubing mode activation
  const activateSpeedcubingMode = useCallback((shouldReset = true) => {
    // Reset cube to initial state only when specified
    if (shouldReset && resetCube) {
      resetCube()
    }

    // Don't reset time if we're preserving a completed solve record
    if (timerState !== 'stopped' || shouldReset) {
      setCurrentTime(0)
    }

    setTimerState(timerState === 'stopped' && !shouldReset ? 'stopped' : 'idle')
    setIsCubeLocked(true) // Lock cube when entering speedcubing mode
    currentMovesRef.current = []

    // Clear any running timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (prepareTimeoutRef.current) {
      clearTimeout(prepareTimeoutRef.current)
      prepareTimeoutRef.current = null
    }
  }, [resetCube, timerState])

  // Function to handle speedcubing mode deactivation
  const deactivateSpeedcubingMode = useCallback(() => {
    setTimerState('idle')
    setCurrentTime(0)
    setIsCubeLocked(false) // Unlock cube when leaving speedcubing mode
    currentMovesRef.current = []
    
    // Clear any running timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (prepareTimeoutRef.current) {
      clearTimeout(prepareTimeoutRef.current)
      prepareTimeoutRef.current = null
    }
  }, [])

  return {
    timerState,
    currentTime,
    records,
    isSpacePressed,
    isCubeLocked,
    startPreparing,
    cancelPreparing,
    stopTimer,
    resetTimer,
    addMove,
    lockCube,
    activateSpeedcubingMode,
    deactivateSpeedcubingMode,
    formatTime
  }
}