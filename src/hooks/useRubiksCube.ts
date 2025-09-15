import { useState, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { RubiksCubeState, MoveHistory } from '../types'
import { rotateLayer, shuffleCube, resetCube, getInverseMove } from '../utils/rotationSystem'

/**
 * Convert internal notation to display notation for History Bar
 * Ensures consistent display regardless of internal rotation logic
 */
function convertToDisplayNotation(notation: string): string {
  // Map the actual executed notation to the desired display notation
  const displayMap: Record<string, string> = {
    // Current problematic mappings -> desired display
    "F'": "F",   // Q key should show F, not F'
    "B'": "B",   // E key should show B, not B'  
    "L'": "L",   // A key should show L, not L'
    "R'": "R",   // D key should show R, not R'
    
    // Correct mappings (keep as-is)
    "F": "F",
    "B": "B", 
    "L": "L",
    "R": "R",
    "U": "U",
    "U'": "U'",
    "D": "D", 
    "D'": "D'",
    
    // When Shift is pressed, these should become primed
    // This will be handled by the keyboard logic
  }
  
  return displayMap[notation] || notation
}

/**
 * Custom hook to manage Rubik's cube state and operations
 */
export function useRubiksCube() {
  const [cubeState, setCubeState] = useState<RubiksCubeState>('idle')
  const [history, setHistory] = useState<MoveHistory>({ moves: [], currentIndex: -1 })
  const [moveHistory, setMoveHistory] = useState<string[]>([]) // Visual history stack
  const [animationSpeed, setAnimationSpeed] = useState(0.2)
  
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cubesRef = useRef<THREE.Mesh[]>([])
  
  // Execute a move with history tracking
  const executeMove = useCallback(async (
    notation: string,
    addToHistory: boolean = true,
    duration?: number,
    showHighlight: boolean = true,
    displayNotation?: string
  ) => {
    if (cubeState !== 'idle' || !sceneRef.current) return
    
    setCubeState('animating')
    
    try {
      await rotateLayer(
        sceneRef.current,
        cubesRef.current,
        notation,
        duration || animationSpeed,
        showHighlight
      )
      
      if (addToHistory) {
        setHistory(prev => ({
          moves: [...prev.moves.slice(0, prev.currentIndex + 1), notation],
          currentIndex: prev.currentIndex + 1
        }))
        // Add to visual history stack with provided display notation or converted notation
        const finalDisplayNotation = displayNotation || convertToDisplayNotation(notation)
        setMoveHistory(prev => [...prev, finalDisplayNotation])
      }
    } finally {
      setCubeState('idle')
    }
  }, [cubeState, animationSpeed])
  
  // Undo last move
  const undoMove = useCallback(async () => {
    if (cubeState !== 'idle' || history.currentIndex < 0) return
    
    const lastMove = history.moves[history.currentIndex]
    const inverseMove = getInverseMove(lastMove)
    
    setCubeState('animating')
    
    try {
      await rotateLayer(
        sceneRef.current!,
        cubesRef.current,
        inverseMove,
        animationSpeed * 0.8, // Slightly faster for undo
        false // No highlight for undo
      )
      
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1
      }))
    } finally {
      setCubeState('idle')
    }
  }, [cubeState, history, animationSpeed])
  
  // Redo move
  const redoMove = useCallback(async () => {
    if (cubeState !== 'idle' || history.currentIndex >= history.moves.length - 1) return
    
    const nextMove = history.moves[history.currentIndex + 1]
    
    setCubeState('animating')
    
    try {
      await rotateLayer(
        sceneRef.current!,
        cubesRef.current,
        nextMove,
        animationSpeed * 0.8, // Slightly faster for redo
        false // No highlight for redo
      )
      
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }))
    } finally {
      setCubeState('idle')
    }
  }, [cubeState, history, animationSpeed])
  
  // Shuffle cube
  const shuffle = useCallback(async (moves: number = 25) => {
    if (cubeState !== 'idle' || !sceneRef.current) return
    
    setCubeState('shuffling')
    
    try {
      await shuffleCube(sceneRef.current, cubesRef.current, moves)
      
      // Clear history after shuffle
      setHistory({ moves: [], currentIndex: -1 })
    } finally {
      setCubeState('idle')
    }
  }, [cubeState])
  
  // Reset cube to solved state
  const reset = useCallback(() => {
    if (cubeState !== 'idle') return
    
    resetCube(cubesRef.current)
    setHistory({ moves: [], currentIndex: -1 })
    setMoveHistory([]) // Clear visual history
  }, [cubeState])
  
  // Clear history only
  const clearHistory = useCallback(() => {
    setMoveHistory([])
  }, [])
  
  return {
    // State
    cubeState,
    history,
    moveHistory,
    animationSpeed,
    
    // Actions
    executeMove,
    undoMove,
    redoMove,
    shuffle,
    reset,
    clearHistory,
    setAnimationSpeed,
    setMoveHistory,
    
    // Refs for components
    sceneRef,
    cubesRef
  }
}