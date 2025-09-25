import { useState, useEffect } from 'react';
import { CubeColors } from '../constants/colorPresets';

interface AppSettings {
  animationSpeed: number;
  zoomLevel: number;
  colorPresetId: string;
  customColors?: Partial<CubeColors>;
}

const STORAGE_KEY = 'rubiks-cube-app-settings';

const DEFAULT_SETTINGS: AppSettings = {
  animationSpeed: 0.2, // 200ms default animation speed
  zoomLevel: 1.0,
  colorPresetId: 'standard'
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // localStorage에서 설정 불러오기
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings: AppSettings = JSON.parse(savedSettings);

        // 유효성 검사
        const validatedSettings: AppSettings = {
          animationSpeed: typeof parsedSettings.animationSpeed === 'number'
            ? Math.max(0.1, Math.min(2.0, parsedSettings.animationSpeed))
            : DEFAULT_SETTINGS.animationSpeed,
          zoomLevel: typeof parsedSettings.zoomLevel === 'number'
            ? Math.max(0.5, Math.min(3.0, parsedSettings.zoomLevel))
            : DEFAULT_SETTINGS.zoomLevel,
          colorPresetId: typeof parsedSettings.colorPresetId === 'string'
            ? parsedSettings.colorPresetId
            : DEFAULT_SETTINGS.colorPresetId,
          customColors: parsedSettings.customColors || undefined
        };

        setSettings(validatedSettings);
      }
    } catch (error) {
      console.warn('Failed to load app settings from localStorage:', error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // 설정을 localStorage에 저장
  const saveSettings = (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Failed to save app settings to localStorage:', error);
    }
  };

  // 개별 설정 업데이트 함수들
  const updateAnimationSpeed = (speed: number) => {
    const validSpeed = Math.max(0.1, Math.min(2.0, speed));
    saveSettings({ animationSpeed: validSpeed });
  };

  const updateZoomLevel = (zoom: number) => {
    const validZoom = Math.max(0.5, Math.min(3.0, zoom));
    saveSettings({ zoomLevel: validZoom });
  };

  const updateColorSettings = (presetId: string, customColors?: Partial<CubeColors>) => {
    saveSettings({
      colorPresetId: presetId,
      customColors: customColors
    });
  };

  // 설정 초기화
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove app settings from localStorage:', error);
    }
  };

  return {
    // 현재 설정값
    animationSpeed: settings.animationSpeed,
    zoomLevel: settings.zoomLevel,
    colorPresetId: settings.colorPresetId,
    customColors: settings.customColors,

    // 업데이트 함수들
    updateAnimationSpeed,
    updateZoomLevel,
    updateColorSettings,

    // 전체 설정 관리
    resetSettings,
    settings
  };
}