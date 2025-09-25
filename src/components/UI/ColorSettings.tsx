import { useState } from 'react';
import { useColorSettings } from '../../hooks/useColorSettings';

interface ColorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (colors: any) => void;
  onSaveSettings?: (presetId: string, customColors?: any) => void;
}

export function ColorSettings({ isOpen, onClose, onApply, onSaveSettings }: ColorSettingsProps) {
  const {
    currentPresetId,
    customColors,
    availablePresets,
    getCurrentPreset,
    setPreset,
    previewPreset,
    clearPreview,
    getDisplayColors
  } = useColorSettings();

  const [selectedPresetId, setSelectedPresetId] = useState(currentPresetId);

  if (!isOpen) return null;

  // 프리셋 선택 시 미리보기
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    previewPreset(presetId);
  };

  // 적용 버튼 클릭
  const handleApply = () => {
    setPreset(selectedPresetId);
    const colors = getDisplayColors();
    onApply(colors);

    // useAppSettings에도 색상 설정 저장
    if (onSaveSettings) {
      onSaveSettings(selectedPresetId, customColors);
    }

    clearPreview();
    onClose();
  };

  // 취소 버튼 클릭
  const handleCancel = () => {
    clearPreview();
    setSelectedPresetId(currentPresetId);
    onClose();
  };

  const currentPreset = getCurrentPreset();

  return (
    <div className="color-settings-overlay">
      <div className="color-settings-modal">
        <div className="modal-header">
          <h3>🎨 색상 설정</h3>
          <button onClick={handleCancel} className="close-btn">×</button>
        </div>

        <div className="modal-content">
          <div className="current-preset-info">
            <h4>현재 설정</h4>
            <div className="preset-item active">
              <div className="preset-info">
                <span className="preset-name">{currentPreset?.name || '표준'}</span>
                <span className="preset-desc">{currentPreset?.description || '기본 색상 설정'}</span>
              </div>
              <div className="color-preview">
                {currentPreset?.colors && Object.entries(currentPreset.colors).slice(0, 6).map(([face, color]) => (
                  <div
                    key={face}
                    className="color-swatch"
                    style={{ backgroundColor: `#${color.toString(16).padStart(6, '0')}` }}
                    title={face}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="presets-section">
            <h4>색상 프리셋 선택</h4>
            <div className="presets-list">
              {availablePresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`preset-item ${selectedPresetId === preset.id ? 'selected' : ''}`}
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  <div className="preset-info">
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-desc">{preset.description}</span>
                  </div>
                  <div className="color-preview">
                    {Object.entries(preset.colors).slice(0, 6).map(([face, color]) => (
                      <div
                        key={face}
                        className="color-swatch"
                        style={{ backgroundColor: `#${color.toString(16).padStart(6, '0')}` }}
                        title={face}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="color-comparison">
            <h4>색상 구분 테스트</h4>
            <div className="comparison-cubes">
              <div className="cube-face red" style={{ backgroundColor: `#${getDisplayColors().RIGHT.toString(16).padStart(6, '0')}` }}>
                <span>빨강</span>
              </div>
              <div className="cube-face orange" style={{ backgroundColor: `#${getDisplayColors().LEFT.toString(16).padStart(6, '0')}` }}>
                <span>주황</span>
              </div>
            </div>
            <p className="comparison-note">
              위 두 색상이 구분하기 어렵다면 다른 프리셋을 선택해보세요.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleCancel} className="cancel-btn">
            취소
          </button>
          <button onClick={handleApply} className="apply-btn">
            적용
          </button>
        </div>
      </div>

      <style>{`
        .color-settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(5px);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .color-settings-modal {
          background: rgba(30, 30, 30, 0.95);
          border-radius: 16px;
          padding: 24px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 16px;
        }

        .modal-header h3 {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-size: 1.4em;
          font-weight: 600;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 20px;
          cursor: pointer;
          padding: 8px 12px;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .modal-content {
          color: rgba(255, 255, 255, 0.9);
        }

        .current-preset-info h4,
        .presets-section h4,
        .color-comparison h4 {
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1em;
          font-weight: 600;
        }

        .preset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .preset-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .preset-item.selected {
          background: rgba(51, 154, 240, 0.2);
          border: 1px solid #339af0;
          box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
        }

        .preset-item.active {
          background: rgba(46, 204, 113, 0.2);
          border: 1px solid #2ecc71;
          box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
        }

        .preset-info {
          flex: 1;
        }

        .preset-name {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
          color: rgba(255, 255, 255, 0.9);
        }

        .preset-desc {
          display: block;
          font-size: 0.9em;
          color: rgba(255, 255, 255, 0.7);
        }

        .color-preview {
          display: flex;
          gap: 4px;
        }

        .color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .presets-list {
          max-height: 250px;
          overflow-y: auto;
          margin-bottom: 24px;
          padding-right: 4px;
        }

        .presets-list::-webkit-scrollbar {
          width: 4px;
        }

        .presets-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .presets-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .presets-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .color-comparison {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }

        .comparison-cubes {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 12px;
        }

        .cube-face {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .comparison-note {
          text-align: center;
          font-size: 0.9em;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
        }

        .cancel-btn,
        .apply-btn {
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          border: 1px solid;
        }

        .cancel-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .cancel-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .apply-btn {
          background: rgba(51, 154, 240, 0.1);
          color: #339af0;
          border-color: rgba(51, 154, 240, 0.3);
        }

        .apply-btn:hover {
          background: rgba(51, 154, 240, 0.2);
          border-color: #339af0;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(51, 154, 240, 0.3);
        }
      `}</style>
    </div>
  );
}