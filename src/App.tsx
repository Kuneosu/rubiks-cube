import { useState, useEffect, useRef } from "react";
import { Scene } from "./components/Scene";
import { CameraMinimap } from "./components/CameraMinimap";
import { KeyGuide } from "./components/KeyGuide";
import { HistoryBar } from "./components/UI/HistoryBar";
import { SpeedcubeTimer } from "./components/UI/SpeedcubeTimer";
import { ModeToggle } from "./components/UI/ModeToggle";
import { RankingPanel } from "./components/UI/RankingPanel";
import { NicknameInputModal } from "./components/UI/NicknameInputModal";
import { ColorSettings } from "./components/UI/ColorSettings";
import { useRubiksCube } from "./hooks/useRubiksCube";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useGridCameraNavigation } from "./hooks/useGridCameraNavigation";
import { useSpeedcubeTimer } from "./hooks/useSpeedcubeTimer";
import { useColorSettings } from "./hooks/useColorSettings";
import { useAppSettings } from "./hooks/useAppSettings";
import { isSimpleCubeSolved } from "./utils/cubeValidator";
import { ShuffleConfirmModal } from "./components/UI/ShuffleConfirmModal";
import "./components/UI/styles.css";

function App() {
  // App settings (localStorage 연동)
  const {
    animationSpeed: savedAnimationSpeed,
    zoomLevel: savedZoomLevel,
    colorPresetId: savedColorPresetId,
    customColors: savedCustomColors,
    updateAnimationSpeed,
    updateZoomLevel,
    updateColorSettings
  } = useAppSettings();

  const [isSpeedcubingMode, setIsSpeedcubingMode] = useState(false);
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [showRankingPanel, setShowRankingPanel] = useState(true);
  const [showKeyGuide, setShowKeyGuide] = useState(true);
  const [isCameraMinimapVisible, setIsCameraMinimapVisible] = useState(true);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [completionTime, setCompletionTime] = useState(0);
  const [isInputMode, setIsInputMode] = useState(false); // 입력 모드 상태
  const [showColorSettings, setShowColorSettings] = useState(false);

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
    executeMove,
    undoMove,
    redoMove,
    shuffle,
    reset,
    clearHistory,
    sceneRef,
    cubesRef,
  } = useRubiksCube(savedAnimationSpeed);

  // Color settings (직접 저장된 설정값 사용)
  const colorSettings = useColorSettings();

  // 색상 설정 초기화 로직 개선
  useEffect(() => {
    // savedColorPresetId가 로드되면 즉시 colorSettings에 적용
    if (savedColorPresetId) {
      colorSettings.updateFromExternal(savedColorPresetId, savedCustomColors);
    }
  }, [savedColorPresetId, savedCustomColors]);

  // 큐브 생성 감지를 위한 상태
  const [cubesCreated, setCubesCreated] = useState(false);

  // 큐브가 생성되었는지 확인
  useEffect(() => {
    if (cubesRef.current && cubesRef.current.length > 0 && !cubesCreated) {
      setCubesCreated(true);
    }
  }, [cubesRef.current?.length, cubesCreated]);

  // 큐브가 생성된 후 색상 설정 변경 시에만 색상 적용
  useEffect(() => {
    if (cubesCreated && cubesRef.current && cubesRef.current.length > 0) {
      const colors = colorSettings.getDisplayColors();
      import('./utils/cubeGeometry').then(({ updateCubeColors }) => {
        updateCubeColors(cubesRef.current, colors);
      });
    }
  }, [cubesCreated, colorSettings.currentPresetId, colorSettings.customColors]);

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
      // First time entering speedcubing mode - reset cube and close all panels
      activateSpeedcubingMode(true);

      // Close all panels for distraction-free speedcubing
      setShowRankingPanel(false);
      setShowKeyGuide(false);
      setIsCameraMinimapVisible(false);
    } else if (!isSpeedcubingMode && wasSpeedcubingMode) {
      // Exiting speedcubing mode - restore panels
      deactivateSpeedcubingMode();

      // Restore panels to their default state
      setShowRankingPanel(true);
      setShowKeyGuide(true);
      setIsCameraMinimapVisible(true);
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
        resetTimer(); // Keep cube locked in speedcubing mode
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

  // 애니메이션 속도 변경 핸들러
  const handleAnimationSpeedChange = (speed: number) => {
    updateAnimationSpeed(speed);
  };

  // 줌 레벨 변경 핸들러
  const handleZoomLevelChange = (zoom: number) => {
    updateZoomLevel(zoom);
  };

  // 색상 변경 핸들러 (localStorage에 저장 + 큐브 업데이트)
  const handleColorChange = (colors: any) => {
    // 현재 큐브들의 색상을 업데이트
    if (cubesRef.current && cubesRef.current.length > 0) {
      import('./utils/cubeGeometry').then(({ updateCubeColors }) => {
        updateCubeColors(cubesRef.current, colors);
      });
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
    onAnimationSpeedChange: handleAnimationSpeedChange,
    onZoomChange: handleZoomLevelChange,
    onModeToggle: () => {
      setIsSpeedcubingMode(!isSpeedcubingMode);
    },
    animationSpeed: savedAnimationSpeed,
    zoomLevel: savedZoomLevel,
    isAnimating: cubeState !== "idle",
    currentCamera: currentCamera,
    isCubeLocked: isCubeLocked,
    isSpeedcubingMode: isSpeedcubingMode,
    timerState: timerState,
    isInputMode: isInputMode, // 입력 모드 상태 전달
  });

  // 색상 설정 저장 핸들러
  const handleColorSettingsSave = (presetId: string, customColors?: any) => {
    updateColorSettings(presetId, customColors);
  };

  return (
    <div className="app">
      {/* Mode Toggle */}
      <ModeToggle
        isSpeedcubingMode={isSpeedcubingMode}
        onToggle={(mode) => {
          setIsSpeedcubingMode(mode);
        }}
      />


      {/* 3D Scene */}
      <Scene
        cubesRef={cubesRef}
        sceneRef={sceneRef}
        currentCamera={currentCamera}
        cubeState={cubeState}
        zoomLevel={savedZoomLevel}
        animationSpeed={savedAnimationSpeed}
        colors={colorSettings.getDisplayColors()}
      />

      {/* Camera Minimap */}
      <CameraMinimap
        currentCamera={currentCamera}
        onCameraSelect={jumpToCamera}
        animationSpeed={savedAnimationSpeed}
        onSpeedChange={handleAnimationSpeedChange}
        onZoomChange={handleZoomLevelChange}
        zoomLevel={savedZoomLevel}
        onVisibilityChange={setIsCameraMinimapVisible}
        isVisible={isCameraMinimapVisible}
        onColorSettings={() => setShowColorSettings(true)}
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

      {/* Color Settings Modal */}
      <ColorSettings
        isOpen={showColorSettings}
        onClose={() => setShowColorSettings(false)}
        onApply={handleColorChange}
        onSaveSettings={handleColorSettingsSave}
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
          <div className="footer-links">
            <a href="https://k-library.vercel.app/" target="_blank" rel="noopener noreferrer">
              Portfolio
            </a>
            <a href="https://github.com/Kuneosu" target="_blank" rel="noopener noreferrer">
              Github
            </a>
          </div>
          <p>&copy; 2025 Kuneosu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
