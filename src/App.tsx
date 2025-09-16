import { useState, useEffect, useRef } from "react";
import { Scene } from "./components/Scene";
import { CameraMinimap } from "./components/CameraMinimap";
import { KeyGuide } from "./components/KeyGuide";
import { HistoryBar } from "./components/UI/HistoryBar";
import { SpeedcubeTimer } from "./components/UI/SpeedcubeTimer";
import { ModeToggle } from "./components/UI/ModeToggle";
import { RankingPanel } from "./components/UI/RankingPanel";
import { NicknameInputModal } from "./components/UI/NicknameInputModal";
import { useRubiksCube } from "./hooks/useRubiksCube";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useGridCameraNavigation } from "./hooks/useGridCameraNavigation";
import { useSpeedcubeTimer } from "./hooks/useSpeedcubeTimer";
import { isSimpleCubeSolved } from "./utils/cubeValidator";
import { ShuffleConfirmModal } from "./components/UI/ShuffleConfirmModal";
import "./components/UI/styles.css";

function App() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSpeedcubingMode, setIsSpeedcubingMode] = useState(false);
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [showRankingPanel, setShowRankingPanel] = useState(true);
  const [showKeyGuide, setShowKeyGuide] = useState(true);
  const [isCameraMinimapVisible, setIsCameraMinimapVisible] = useState(true);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [completionTime, setCompletionTime] = useState(0);
  const [isInputMode, setIsInputMode] = useState(false); // 입력 모드 상태

  // Track previous speedcubing mode state
  const prevSpeedcubingModeRef = useRef(isSpeedcubingMode);

  // 16-camera grid navigation
  const {
    currentCamera,
    moveLeft,
    moveRight,
    moveOpposite,
    moveVertical,
    jumpToCamera,
    jumpToFace,
  } = useGridCameraNavigation();

  const {
    cubeState,
    moveHistory,
    animationSpeed,
    executeMove,
    undoMove,
    redoMove,
    shuffle,
    reset,
    clearHistory,
    setAnimationSpeed,
    sceneRef,
    cubesRef,
  } = useRubiksCube();

  // Speedcube timer
  const {
    timerState,
    currentTime,
    startPreparing,
    cancelPreparing,
    stopTimer,
    resetTimer,
    formatTime,
    addMove,
    lockCube,
    isCubeLocked,
    activateSpeedcubingMode,
    deactivateSpeedcubingMode
  } = useSpeedcubeTimer(reset);

  // Handle speedcubing mode activation/deactivation
  useEffect(() => {
    const wasSpeedcubingMode = prevSpeedcubingModeRef.current;
    
    if (isSpeedcubingMode && !wasSpeedcubingMode) {
      // First time entering speedcubing mode - reset cube
      activateSpeedcubingMode(true);
    } else if (!isSpeedcubingMode && wasSpeedcubingMode) {
      // Exiting speedcubing mode
      deactivateSpeedcubingMode();
    }
    
    // Update previous state
    prevSpeedcubingModeRef.current = isSpeedcubingMode;
  }, [isSpeedcubingMode]);

  // Enhanced executeMove that also tracks timer moves
  const executeWithTimer = (notation: string, addToHistory?: boolean, duration?: number, showHighlight?: boolean, displayNotation?: string) => {
    // Block cube movements if in speedcubing mode and cube is locked
    if (isSpeedcubingMode && isCubeLocked) {
      return;
    }
    
    executeMove(notation, addToHistory, duration, showHighlight, displayNotation);
    if (displayNotation) {
      addMove(displayNotation);
    }
  };

  // Reset camera to initial position for solving detection
  const resetCameraToInitial = () => {
    console.log('🔄 Resetting camera to initial position: upper-0');
    jumpToCamera('upper-0');
  };

  // Timer control functions (only active in speedcubing mode)
  const handleTimerSpaceDown = () => {
    // In normal mode, reset camera and analyze
    if (!isSpeedcubingMode) {
      resetCameraToInitial();
      setTimeout(() => {
        const isSolved = isSimpleCubeSolved(cubesRef.current);
        console.log('🔍 Cube solved:', isSolved ? '✅ SOLVED' : '❌ NOT SOLVED');
      }, 500);
      return;
    }

    // In speedcubing mode, check solve state immediately
    const isSolved = isSimpleCubeSolved(cubesRef.current);
    console.log('🔍 Space down - Cube solved:', isSolved ? '✅ SOLVED' : '❌ NOT SOLVED', 'timer state:', timerState);

    if ((timerState === 'idle' || timerState === 'stopped') && !isSolved) {
      console.log('✅ Starting timer preparation');
      // Reset camera for timer preparation
      resetCameraToInitial();
      startPreparing();
    } else if (isSolved && (timerState === 'idle' || timerState === 'stopped')) {
      console.log('🎯 Cube already solved, showing shuffle modal');
      setShowShuffleModal(true);
    } else {
      console.log('❌ Conditions not met for timer start or shuffle modal');
    }
  };

  const handleTimerSpaceUp = () => {
    if (!isSpeedcubingMode) return;

    if (timerState === 'preparing' || timerState === 'ready') {
      cancelPreparing();
    } else if (timerState === 'running') {
      // Check solve state immediately
      const solved = isSimpleCubeSolved(cubesRef.current);
      console.log('🔍 Space up - Cube solved:', solved ? '✅ SOLVED' : '❌ NOT SOLVED');

      if (solved) {
        console.log('✅ Stopping timer - cube is solved!');
        const success = stopTimer(solved, moveHistory);
        if (success) {
          // Reset camera after successful timer stop
          resetCameraToInitial();
          // Show nickname modal with completion time
          setCompletionTime(currentTime / 1000); // Convert to seconds
          setShowNicknameModal(true);
          setIsInputMode(true); // 입력 모드 활성화
        }
      } else {
        console.log('❌ Timer continues - cube not solved');
      }
    }
  };

  // Shuffle modal handlers
  const handleShuffleConfirm = () => {
    setShowShuffleModal(false);
    shuffle(25); // Shuffle with 25 moves
    if (isSpeedcubingMode) {
      lockCube(); // Lock cube after shuffling in speedcubing mode
      // Reset timer to idle state when starting a new scramble
      if (timerState === 'stopped') {
        resetTimer();
      }
    }
  };

  const handleShuffleCancel = () => {
    setShowShuffleModal(false);
  };

  // Nickname modal handlers
  const handleNicknameModalClose = () => {
    setShowNicknameModal(false);
    setCompletionTime(0);
    setIsInputMode(false); // 입력 모드 해제
  };

  const handleRecordSaved = (success: boolean) => {
    if (success) {
      console.log('✅ Record saved successfully to ranking');
      // Refresh ranking panel if it's open
      // The RankingPanel will automatically refresh when the tab is switched
    } else {
      console.log('⚠️ Record saved to local storage but failed to save to online ranking');
    }
  };



  // Keyboard controls
  useKeyboardControls({
    onFaceRotation: executeWithTimer,
    onCameraView: jumpToFace,
    onCameraJump: jumpToCamera,
    onCameraLeft: moveLeft,
    onCameraRight: moveRight,
    onCameraOpposite: moveOpposite,
    onCameraVertical: moveVertical,
    onUndo: undoMove,
    onRedo: redoMove,
    onShuffle: () => {
      shuffle();
      if (isSpeedcubingMode) {
        lockCube();
      }
    },
    onReset: () => {
      if (!isSpeedcubingMode) {
        reset();
      }
    },
    onToggleControls: () => {
      // Currently no controls panel to toggle
    },
    onTimerSpaceDown: handleTimerSpaceDown,
    onTimerSpaceUp: handleTimerSpaceUp,
    onAnimationSpeedChange: setAnimationSpeed,
    onZoomChange: setZoomLevel,
    onModeToggle: () => setIsSpeedcubingMode(!isSpeedcubingMode),
    animationSpeed: animationSpeed,
    zoomLevel: zoomLevel,
    isAnimating: cubeState !== "idle",
    currentCamera: currentCamera,
    isCubeLocked: isCubeLocked,
    isSpeedcubingMode: isSpeedcubingMode,
    timerState: timerState,
    isInputMode: isInputMode, // 입력 모드 상태 전달
  });

  return (
    <div className="app">
      {/* Mode Toggle */}
      <ModeToggle 
        isSpeedcubingMode={isSpeedcubingMode}
        onToggle={setIsSpeedcubingMode}
      />


      {/* 3D Scene */}
      <Scene
        cubesRef={cubesRef}
        sceneRef={sceneRef}
        currentCamera={currentCamera}
        cubeState={cubeState}
        zoomLevel={zoomLevel}
        animationSpeed={animationSpeed}
      />

      {/* Camera Minimap */}
      <CameraMinimap
        currentCamera={currentCamera}
        onCameraSelect={jumpToCamera}
        animationSpeed={animationSpeed}
        onSpeedChange={setAnimationSpeed}
        onZoomChange={setZoomLevel}
        zoomLevel={zoomLevel}
        onVisibilityChange={setIsCameraMinimapVisible}
      />

      {/* Speedcube Timer (only in speedcubing mode) */}
      {isSpeedcubingMode && (
        <SpeedcubeTimer
          timerState={timerState}
          currentTime={currentTime}
          formatTime={formatTime}
          isCubeLocked={isCubeLocked}
        />
      )}


      {/* History Bar */}
      <HistoryBar 
        history={moveHistory}
        onClear={() => {
          if (!isSpeedcubingMode) {
            clearHistory();
          }
        }}
      />


      {/* Key Guide Panel */}
      <KeyGuide
        isVisible={showKeyGuide}
        onToggleVisibility={() => setShowKeyGuide(!showKeyGuide)}
        isCameraMinimapVisible={isCameraMinimapVisible}
      />

      {/* Ranking Panel */}
      <RankingPanel
        isVisible={showRankingPanel}
        onToggleVisibility={() => setShowRankingPanel(!showRankingPanel)}
      />

      {/* Shuffle Confirmation Modal */}
      <ShuffleConfirmModal
        isOpen={showShuffleModal}
        onConfirm={handleShuffleConfirm}
        onCancel={handleShuffleCancel}
      />

      {/* Nickname Input Modal */}
      <NicknameInputModal
        isOpen={showNicknameModal}
        completionTime={completionTime}
        onClose={handleNicknameModalClose}
        onRecordSaved={handleRecordSaved}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 Kuneosu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
