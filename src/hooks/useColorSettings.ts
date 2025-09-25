import { useState, useCallback } from 'react';
import {
  CubeColors,
  ColorPreset,
  COLOR_PRESETS,
  DEFAULT_PRESET_ID,
  STANDARD_PRESET
} from '../constants/colorPresets';

// localStorage 관리는 useAppSettings에서 담당하므로 제거
// const STORAGE_KEY = 'rubiks-cube-color-settings';

export function useColorSettings() {
  const [currentPresetId, setCurrentPresetId] = useState<string>(DEFAULT_PRESET_ID);
  const [customColors, setCustomColors] = useState<Partial<CubeColors>>({});
  const [isCustomized, setIsCustomized] = useState(false);

  // localStorage 관리는 useAppSettings에서 담당하므로 제거
  // 초기값은 외부에서 updateFromExternal을 통해 설정됨

  // localStorage 저장 로직 제거 (useAppSettings에서 담당)

  // 외부에서 색상 설정을 업데이트하는 함수 (useAppSettings와 연동용, localStorage 저장 없음)
  const updateFromExternal = useCallback((presetId: string, customColors?: Partial<CubeColors>) => {
    // 현재 상태와 같으면 업데이트하지 않음 (무한 루프 방지)
    if (currentPresetId === presetId &&
        JSON.stringify(customColors || {}) === JSON.stringify(customColors)) {
      return;
    }

    setCurrentPresetId(presetId);
    setCustomColors(customColors || {});
    setIsCustomized(!!customColors && Object.keys(customColors).length > 0);
  }, [currentPresetId, customColors]);

  // 프리셋 변경 (localStorage 저장 제거)
  const setPreset = (presetId: string) => {
    setCurrentPresetId(presetId);
    setCustomColors({});
    setIsCustomized(false);
    // localStorage 저장은 App.tsx에서 handleColorSettingsSave를 통해 처리
  };

  // 개별 색상 변경 (localStorage 저장 제거)
  const setCustomColor = (face: keyof CubeColors, color: number) => {
    const newCustomColors = {
      ...customColors,
      [face]: color
    };
    setCustomColors(newCustomColors);
    setIsCustomized(true);
    // localStorage 저장은 외부에서 처리
  };

  // 커스터마이징 초기화 (localStorage 저장 제거)
  const resetCustomization = () => {
    setCustomColors({});
    setIsCustomized(false);
    // localStorage 저장은 외부에서 처리
  };

  // 현재 적용된 색상 가져오기
  const getCurrentColors = (): CubeColors => {
    const currentPreset = COLOR_PRESETS.find(preset => preset.id === currentPresetId);
    const baseColors = currentPreset?.colors || STANDARD_PRESET;

    return {
      ...baseColors,
      ...customColors
    };
  };

  // 현재 프리셋 정보 가져오기
  const getCurrentPreset = (): ColorPreset | null => {
    return COLOR_PRESETS.find(preset => preset.id === currentPresetId) || null;
  };

  // 색상 미리보기 (임시로 색상 적용하지만 저장하지는 않음)
  const [previewColors, setPreviewColors] = useState<CubeColors | null>(null);

  const previewPreset = (presetId: string) => {
    const preset = COLOR_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setPreviewColors(preset.colors);
    }
  };

  const clearPreview = () => {
    setPreviewColors(null);
  };

  // 현재 표시되어야 할 색상 (미리보기가 있으면 미리보기 색상, 없으면 현재 설정 색상)
  const getDisplayColors = (): CubeColors => {
    return previewColors || getCurrentColors();
  };

  return {
    // 현재 상태
    currentPresetId,
    customColors,
    isCustomized,

    // 색상 정보
    getCurrentColors,
    getCurrentPreset,
    getDisplayColors,

    // 프리셋 관리
    setPreset,
    availablePresets: COLOR_PRESETS,

    // 커스터마이징
    setCustomColor,
    resetCustomization,

    // 미리보기
    previewColors,
    previewPreset,
    clearPreview,

    // 외부 연동
    updateFromExternal
  };
}