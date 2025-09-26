import { useEffect, useCallback, useRef } from 'react'
import { getCameraRelativeMapping } from '../utils/cameraRelativeControls'
import { getCameraRelativeXRotation } from '../utils/cameraRelativeMath'
import {
  isTopBottomView,
  getNextTopBottomView,
  getPrevTopBottomView
} from '../constants/cameraLayout'

interface KeyCommand {
  key: string
  shift: boolean
  ctrl: boolean
}

interface UseKeyboardControlsProps {
  onFaceRotation: (notation: string, addToHistory?: boolean, duration?: number, showHighlight?: boolean, displayNotation?: string) => void
  onCameraView: (view: string) => void
  onCameraJump: (cameraId: string) => void
  onCameraLeft: () => void
  onCameraRight: () => void
  onCameraOpposite: () => void
  onCameraVertical: () => void
  onUndo: () => void
  onRedo: () => void
  onShuffle: () => void
  onReset: () => void
  onToggleControls: () => void
  onTimerSpaceDown: () => void
  onTimerSpaceUp: () => void
  onAnimationSpeedChange: (speed: number) => void
  onZoomChange: (zoom: number) => void
  onModeToggle: () => void
  animationSpeed: number
  zoomLevel: number
  isAnimating: boolean
  currentCamera: string
  isCubeLocked?: boolean
  isSpeedcubingMode?: boolean
  timerState?: string
  isInputMode?: boolean // 입력 모드 여부
}

/**
 * Custom hook to handle keyboard controls for the Rubik's cube
 */
export function useKeyboardControls({
  onFaceRotation,
  onCameraView,
  onCameraJump,
  onCameraLeft,
  onCameraRight,
  onCameraOpposite,
  onCameraVertical,
  onUndo,
  onRedo,
  onShuffle,
  onReset,
  onToggleControls,
  onTimerSpaceDown,
  onTimerSpaceUp,
  onAnimationSpeedChange,
  onZoomChange,
  onModeToggle,
  animationSpeed,
  zoomLevel,
  isAnimating,
  currentCamera,
  isCubeLocked,
  isSpeedcubingMode,
  timerState,
  isInputMode
}: UseKeyboardControlsProps) {

  // 키 입력 큐 (크기 1로 제한 - 최근 입력만 보관)
  const keyQueueRef = useRef<KeyCommand | null>(null)
  const prevAnimatingRef = useRef(isAnimating)

  // 실제 키 명령을 실행하는 함수 (큐 처리에도 사용)
  const executeKeyCommand = useCallback((event: KeyboardEvent) => {
    // Prevent actions during input mode (nickname input, etc.)
    if (isInputMode) return

    let key = event.key.toLowerCase()
    let shift = event.shiftKey
    const ctrl = event.ctrlKey || event.metaKey

    // Korean keyboard layout support mapping
    const koreanToEnglishMap: Record<string, string> = {
      // Main cube rotation keys (QWEASD)
      'ㅂ': 'q',  // q = ㅂ
      'ㅈ': 'w',  // w = ㅈ
      'ㄷ': 'e',  // e = ㄷ
      'ㅁ': 'a',  // a = ㅁ
      'ㄴ': 's',  // s = ㄴ
      'ㅇ': 'd',  // d = ㅇ

      // Camera navigation keys (IJKL)
      'ㅑ': 'i',  // i = ㅑ (camera up)
      'ㅓ': 'j',  // j = ㅓ (camera left)
      'ㅏ': 'k',  // k = ㅏ (camera down)
      'ㅣ': 'l',  // l = ㅣ (camera right)

      // Control keys
      'ㄱ': 'r',  // r = ㄱ (reset)
      'ㅅ': 't',  // t = ㅅ (top view)
      'ㅗ': 'h',  // h = ㅗ (help/controls)
      'ㅛ': 'y',  // y = ㅛ (redo)
      'ㅋ': 'z',  // z = ㅋ (undo)

      // Animation speed control keys
      'ㅡ': ',',  // , = ㅡ (decrease speed)
      // Note: ㅣ is already used for 'l' (camera right), so period key uses original mapping
    }

    // Korean Shift key mapping (쌍자음) - these should be treated as Shift+key
    const koreanShiftMap: Record<string, string> = {
      'ㅃ': 'q',  // Shift + q = ㅃ (쌍비읍)
      'ㅉ': 'w',  // Shift + w = ㅉ (쌍지읒)
      'ㄸ': 'e',  // Shift + e = ㄸ (쌍디귿)
    }

    // Convert Korean input to English equivalent
    if (koreanToEnglishMap[key]) {
      key = koreanToEnglishMap[key]
    } else if (koreanShiftMap[key]) {
      // Handle Korean shift characters (쌍자음)
      key = koreanShiftMap[key]
      shift = true  // Force shift to be true for Korean shift characters
    }

    // Face rotation controls (WASD + QE) - camera relative
    if (['w', 'a', 's', 'd', 'q', 'e'].includes(key)) {
      // Block cube rotation if in speedcubing mode and cube is locked
      if (isSpeedcubingMode && isCubeLocked) {
        event.preventDefault()
        return
      }
      event.preventDefault()
      
      // Get camera-relative mapping for current view
      const cameraMapping = getCameraRelativeMapping(currentCamera)
      const face = cameraMapping[key as keyof typeof cameraMapping]
      
      if (!face) {
        console.error(`No mapping found for key ${key} in camera ${currentCamera}`)
        return
      }
      
      // A,D,Q,E keys need reversed rotation direction
      // W,S keys use normal direction
      let notation: string
      
      if (['a', 'd'].includes(key)) {
        // For A,D only: reverse the rotation direction
        if (shift) {
          // Shift + A,D: use face notation as-is
          notation = face
        } else {
          // Basic A,D: reverse the direction
          if (face.includes("'")) {
            notation = face.replace("'", "")  // Remove prime (counterclockwise → clockwise)
          } else {
            notation = face + "'"  // Add prime (clockwise → counterclockwise)
          }
        }
      } else if (['q', 'e'].includes(key)) {
        // For Q,E: different behavior for Top/Bottom vs Corner views
        const isTopBottomView = currentCamera === 'top' || currentCamera.startsWith('top-') || 
                               currentCamera === 'bottom' || currentCamera.startsWith('bottom-')
        
        if (isTopBottomView) {
          // Top/Bottom View: normal direction
          if (shift) {
            if (face.includes("'")) {
              notation = face.replace("'", "")
            } else {
              notation = face + "'"
            }
          } else {
            notation = face
          }
        } else {
          // Corner View: reverse direction (like A,D)
          if (shift) {
            notation = face
          } else {
            if (face.includes("'")) {
              notation = face.replace("'", "")
            } else {
              notation = face + "'"
            }
          }
        }
      } else {
        // For W,S: different behavior for Top/Bottom vs Corner views
        const isTopBottomView = currentCamera === 'top' || currentCamera.startsWith('top-') || 
                               currentCamera === 'bottom' || currentCamera.startsWith('bottom-')
        
        if (isTopBottomView) {
          // Top/Bottom View: reverse direction (like A,D)
          if (shift) {
            notation = face
          } else {
            if (face.includes("'")) {
              notation = face.replace("'", "")
            } else {
              notation = face + "'"
            }
          }
        } else {
          // Corner View: normal direction (original behavior)
          if (shift) {
            if (face.includes("'")) {
              notation = face.replace("'", "")
            } else {
              notation = face + "'"
            }
          } else {
            notation = face
          }
        }
      }
      
      // Generate correct display notation for History Bar
      // Q,W,E,A,S,D should display as F,U,B,L,D,R respectively (with prime for Shift)
      const keyToFaceMap: Record<string, string> = {
        'q': 'F',  // Q = Front face
        'w': 'U',  // W = Up face  
        'e': 'B',  // E = Back face
        'a': 'L',  // A = Left face
        's': 'D',  // S = Down face
        'd': 'R'   // D = Right face
      }
      
      const baseFace = keyToFaceMap[key]
      const displayNotation = shift ? baseFace + "'" : baseFace
      
      console.log(`DEBUG: Camera: ${currentCamera}, Key: ${key}, Face: ${face}, Notation: ${notation}, Display: ${displayNotation}`)
      onFaceRotation(notation, true, undefined, true, displayNotation)
      return
    }

    // Shuffle control (0 key)
    if (key === '0') {
      event.preventDefault()
      onShuffle()
      return
    }

    // IJKL camera navigation (alternative to arrow keys)
    if (['i', 'j', 'k', 'l'].includes(key)) {
      // I = ArrowUp, J = ArrowLeft, K = ArrowDown, L = ArrowRight

      // Special controls for Top/Bottom views - rotate the view, not the cube
      if (isTopBottomView(currentCamera)) {
        console.log(`DEBUG: Top/Bottom view detected: ${currentCamera}`)

        if (key === 'j') { // J = ArrowLeft
          event.preventDefault()
          // Rotate view 90 degrees counterclockwise
          const nextView = getPrevTopBottomView(currentCamera)
          console.log(`DEBUG: J key - ${currentCamera} → ${nextView}`)
          onCameraJump(nextView)
          return
        }

        if (key === 'l') { // L = ArrowRight
          event.preventDefault()
          // Rotate view 90 degrees clockwise
          const nextView = getNextTopBottomView(currentCamera)
          console.log(`DEBUG: L key - ${currentCamera} → ${nextView}`)
          onCameraJump(nextView)
          return
        }

        if (key === 'i' || key === 'k') { // I = ArrowUp, K = ArrowDown
          event.preventDefault()
          // Return to Upper view (default camera)
          console.log(`DEBUG: I/K key - returning to upper-0`)
          onCameraJump('upper-0')
          return
        }
      }

      // Standard camera navigation with IJKL keys (for corner cameras only)
      if (key === 'j') { // J = ArrowLeft
        event.preventDefault()
        onCameraLeft()
        return
      }

      if (key === 'l') { // L = ArrowRight
        event.preventDefault()
        onCameraRight()
        return
      }

      if (key === 'i') { // I = ArrowUp
        event.preventDefault()
        // Block cube rotation if in speedcubing mode and cube is locked
        if (isSpeedcubingMode && isCubeLocked) {
          return
        }
        // 카메라 기준 X축 회전 (아래 방향키와 반대방향)
        const xRotation = getCameraRelativeXRotation(currentCamera)
        const notation = shift ? xRotation : xRotation + "'"
        console.log(`DEBUG: Camera: ${currentCamera}, I key X-Rotation: ${xRotation}, Shift: ${shift}, Notation: ${notation} (opposite of K)`)
        onFaceRotation(notation)
        return
      }

      if (key === 'k') { // K = ArrowDown
        event.preventDefault()
        // Block cube rotation if in speedcubing mode and cube is locked
        if (isSpeedcubingMode && isCubeLocked) {
          return
        }
        // 카메라 기준 X축 회전 (세로 굴리기) - 원래 동작 유지
        const xRotation = getCameraRelativeXRotation(currentCamera)
        const notation = shift ? xRotation + "'" : xRotation
        console.log(`DEBUG: Camera: ${currentCamera}, K key X-Rotation: ${xRotation}, Shift: ${shift}, Notation: ${notation}`)
        onFaceRotation(notation)
        return
      }
    }

    // Special controls for Top/Bottom views - rotate the view, not the cube
    // IMPORTANT: This must come BEFORE standard arrow key navigation
    if (isTopBottomView(currentCamera)) {
      console.log(`DEBUG: Top/Bottom view detected: ${currentCamera}`)
      
      if (event.code === 'ArrowLeft') {
        event.preventDefault()
        // Rotate view 90 degrees counterclockwise
        const nextView = getPrevTopBottomView(currentCamera)
        console.log(`DEBUG: Arrow Left - ${currentCamera} → ${nextView}`)
        onCameraJump(nextView)
        return
      }
      
      if (event.code === 'ArrowRight') {
        event.preventDefault()
        // Rotate view 90 degrees clockwise
        const nextView = getNextTopBottomView(currentCamera)
        console.log(`DEBUG: Arrow Right - ${currentCamera} → ${nextView}`)
        onCameraJump(nextView)
        return
      }
      
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault()
        // Return to Upper view (default camera)
        console.log(`DEBUG: Arrow Up/Down - returning to upper-0`)
        onCameraJump('upper-0')
        return
      }
    }
    
    // Standard camera navigation with arrow keys (for corner cameras only)
    // This will not execute for Top/Bottom views due to early return above
    if (event.code === 'ArrowLeft') {
      event.preventDefault()
      onCameraLeft()
      return
    }
    
    if (event.code === 'ArrowRight') {
      event.preventDefault()
      onCameraRight()
      return
    }
    
    if (event.code === 'ArrowUp') {
      event.preventDefault()
      // Block cube rotation if in speedcubing mode and cube is locked
      if (isSpeedcubingMode && isCubeLocked) {
        return
      }
      // 카메라 기준 X축 회전 (아래 방향키와 반대방향)
      const xRotation = getCameraRelativeXRotation(currentCamera)
      const notation = shift ? xRotation : xRotation + "'"
      console.log(`DEBUG: Camera: ${currentCamera}, X-Rotation: ${xRotation}, Shift: ${shift}, Notation: ${notation} (opposite of down)`)
      onFaceRotation(notation)
      return
    }

    if (event.code === 'ArrowDown') {
      event.preventDefault()
      // Block cube rotation if in speedcubing mode and cube is locked
      if (isSpeedcubingMode && isCubeLocked) {
        return
      }
      // 카메라 기준 X축 회전 (세로 굴리기) - 원래 동작 유지
      const xRotation = getCameraRelativeXRotation(currentCamera)
      const notation = shift ? xRotation + "'" : xRotation
      console.log(`DEBUG: Camera: ${currentCamera}, X-Rotation: ${xRotation}, Shift: ${shift}, Notation: ${notation}`)
      onFaceRotation(notation)
      return
    }
    
    // Mode toggle with Tab key (blocked during timer operation)
    if (event.key === 'Tab') {
      event.preventDefault()

      // Block mode toggle if timer is active (preparing, ready, or running)
      if (isSpeedcubingMode && timerState && ['preparing', 'ready', 'running'].includes(timerState)) {
        console.log('Tab key blocked during timer operation:', timerState)
        return
      }

      onModeToggle()
      return
    }

    // Animation speed and zoom controls with comma and period
    // Check for both original key and lowercased key for Shift combinations
    if (key === ',' || key === '.' || event.key === '<' || event.key === '>') {
      event.preventDefault()

      console.log('Key pressed:', { key, originalKey: event.key, shift })

      // Handle Shift + comma (< symbol) and Shift + period (> symbol)
      if ((key === ',' && shift) || event.key === '<') {
        // Shift + comma: Zoom out (decrease zoom) - min 0.5
        const newZoom = Math.max(0.5, Math.round((zoomLevel - 0.1) * 10) / 10)
        console.log('Zoom out:', newZoom)
        onZoomChange(newZoom)
      } else if ((key === '.' && shift) || event.key === '>') {
        // Shift + period: Zoom in (increase zoom) - max 2.0
        const newZoom = Math.min(2.0, Math.round((zoomLevel + 0.1) * 10) / 10)
        console.log('Zoom in:', newZoom)
        onZoomChange(newZoom)
      } else if (key === ',' && !shift) {
        // Normal comma: Decrease speed (increase duration) - min 0.1s
        const newSpeed = Math.max(0.1, Math.round((animationSpeed - 0.1) * 10) / 10)
        onAnimationSpeedChange(newSpeed)
      } else if (key === '.' && !shift) {
        // Normal period: Increase speed (decrease duration) - max 3.0s
        const newSpeed = Math.min(3.0, Math.round((animationSpeed + 0.1) * 10) / 10)
        onAnimationSpeedChange(newSpeed)
      }
      return
    }


    // Control keys
    switch (key) {
      case 'z':
        if (ctrl) {
          event.preventDefault()
          onUndo()
        }
        break

      case 'y':
        if (ctrl) {
          event.preventDefault()
          onRedo()
        }
        break


      case 'r':
        if (!ctrl) { // Avoid conflict with browser refresh
          event.preventDefault()
          // Block reset if in speedcubing mode
          if (isSpeedcubingMode) {
            return
          }
          onReset()
        }
        break

      case 'h':
        event.preventDefault()
        onToggleControls()
        break

      case 't':
        event.preventDefault()
        onCameraView('top')
        break
    }
  }, [
    currentCamera,
    animationSpeed,
    zoomLevel,
    timerState,
    onFaceRotation,
    onCameraView,
    onCameraJump,
    onCameraLeft,
    onCameraRight,
    onCameraOpposite,
    onCameraVertical,
    onUndo,
    onRedo,
    onShuffle,
    onReset,
    onToggleControls,
    onAnimationSpeedChange,
    onZoomChange,
    onModeToggle,
    isCubeLocked,
    isSpeedcubingMode,
    isInputMode
  ])

  // 큐에서 키 명령 처리하는 함수
  const processQueuedCommand = useCallback((command: KeyCommand) => {
    console.log('Processing queued command:', command.key, command.shift ? '(Shift)' : '')

    const mockEvent = {
      key: command.key,
      shiftKey: command.shift,
      ctrlKey: command.ctrl,
      metaKey: false,
      code: `Key${command.key.toUpperCase()}`,
      preventDefault: () => {},
      repeat: false
    } as KeyboardEvent

    // executeKeyCommand를 직접 호출
    executeKeyCommand(mockEvent)
  }, [executeKeyCommand])

  // 애니메이션 상태 변화 감지 및 큐 처리
  useEffect(() => {
    // 애니메이션이 끝났을 때 (isAnimating: true → false)
    if (prevAnimatingRef.current && !isAnimating && keyQueueRef.current) {
      console.log('Animation ended, processing queued key:', keyQueueRef.current.key)

      // 입력 모드가 아닐 때만 큐 처리
      if (!isInputMode) {
        processQueuedCommand(keyQueueRef.current)
      }

      // 큐 초기화
      keyQueueRef.current = null
    }

    // 현재 애니메이션 상태 저장
    prevAnimatingRef.current = isAnimating
  }, [isAnimating, isInputMode, processQueuedCommand])

  // 새로운 handleKeyPress - 애니메이션 중일 때 큐에 저장
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // 입력 모드일 때는 처리하지 않음
    if (isInputMode) return

    const key = event.key.toLowerCase()
    const shift = event.shiftKey
    const ctrl = event.ctrlKey || event.metaKey

    // 큐브 회전 관련 키만 큐에 저장 (QWEASD)
    const isCubeRotationKey = ['q', 'w', 'e', 'a', 's', 'd'].includes(key) ||
      ['ㅂ', 'ㅈ', 'ㄷ', 'ㅁ', 'ㄴ', 'ㅇ', 'ㅃ', 'ㅉ', 'ㄸ'].includes(key)

    if (isAnimating && isCubeRotationKey) {
      // 애니메이션 중이고 큐브 회전 키인 경우 큐에 저장 (덮어쓰기)
      keyQueueRef.current = { key, shift, ctrl }
      console.log('Queued key during animation:', key, shift ? '(Shift)' : '')
      return
    }

    // 애니메이션 중이 아니거나 큐브 회전 키가 아닌 경우 바로 실행
    executeKeyCommand(event)
  }, [isAnimating, isInputMode, executeKeyCommand])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent actions during input mode
    if (isInputMode) return

    if (event.key === ' ') {
      // Prevent key repeat for spacebar
      if (event.repeat) return
      event.preventDefault()
      onTimerSpaceDown()
    }
  }, [onTimerSpaceDown, isInputMode])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    // Prevent actions during input mode
    if (isInputMode) return

    if (event.key === ' ') {
      event.preventDefault()
      onTimerSpaceUp()
    }
  }, [onTimerSpaceUp, isInputMode])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyPress, handleKeyDown, handleKeyUp])
}