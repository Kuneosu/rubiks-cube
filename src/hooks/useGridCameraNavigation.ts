import { useState, useCallback } from 'react'
import { 
  CAMERA_GRID, 
  getNextCameraId, 
  getPrevCameraId, 
  getOppositeCameraId, 
  toggleLevel 
} from '../constants/cameraLayout'

/**
 * 16개 코너 카메라 네비게이션 훅
 * 
 * 네비게이션 로직:
 * - ←→: 현재 레벨에서 코너 간 이동
 * - ↑: 현재 코너의 반대편 코너로 이동 (같은 레벨)
 * - ↓: 현재 코너의 상하 반대 레벨로 이동
 */
export function useGridCameraNavigation() {
  const [currentCamera, setCurrentCamera] = useState<string>('upper-0') // 시작: 상단 front-right
  
  // 왼쪽으로 이동 (다음 코너 - 반대 방향)
  const moveLeft = useCallback(() => {
    const nextCameraId = getNextCameraId(currentCamera)
    if (CAMERA_GRID[nextCameraId]) {
      setCurrentCamera(nextCameraId)
    }
  }, [currentCamera])
  
  // 오른쪽으로 이동 (이전 코너 - 반대 방향)
  const moveRight = useCallback(() => {
    const nextCameraId = getPrevCameraId(currentCamera)
    if (CAMERA_GRID[nextCameraId]) {
      setCurrentCamera(nextCameraId)
    }
  }, [currentCamera])
  
  // 위로 이동 (반대편 코너, 같은 레벨)
  const moveOpposite = useCallback(() => {
    const oppositeCameraId = getOppositeCameraId(currentCamera)
    if (CAMERA_GRID[oppositeCameraId]) {
      setCurrentCamera(oppositeCameraId)
    }
  }, [currentCamera])
  
  // 아래로 이동 (상하 레벨 변경)
  const moveVertical = useCallback(() => {
    const toggledCameraId = toggleLevel(currentCamera)
    if (CAMERA_GRID[toggledCameraId]) {
      setCurrentCamera(toggledCameraId)
    }
  }, [currentCamera])
  
  // 특정 카메라로 점프
  const jumpToCamera = useCallback((cameraId: string) => {
    if (CAMERA_GRID[cameraId]) {
      setCurrentCamera(cameraId)
    }
  }, [])
  
  // 특정 면으로 점프 (기존 호환성을 위해 유지)
  const jumpToFace = useCallback((face: string) => {
    // 면 이름을 카메라로 매핑 (Top/Bottom은 overhead 카메라 사용)
    const faceToCornerMap: Record<string, string> = {
      'front': 'upper-7',
      'back': 'upper-3',
      'right': 'upper-1',
      'left': 'upper-5',
      'top': 'top',        // Top overhead camera
      'bottom': 'bottom',  // Bottom overhead camera
      'isometric': 'upper-0'
    }
    
    const mappedCamera = faceToCornerMap[face] || 'upper-0'
    jumpToCamera(mappedCamera)
  }, [jumpToCamera])
  
  // 현재 카메라 정보 가져오기
  const getCurrentCameraInfo = useCallback(() => {
    return CAMERA_GRID[currentCamera] || null
  }, [currentCamera])
  
  return {
    currentCamera,
    moveLeft,
    moveRight, 
    moveOpposite,
    moveVertical,
    jumpToCamera,
    jumpToFace,
    getCurrentCameraInfo
  }
}