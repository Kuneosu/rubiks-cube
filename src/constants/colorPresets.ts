export interface CubeColors {
  RIGHT: number;   // Red face
  LEFT: number;    // Orange face
  TOP: number;     // White face
  BOTTOM: number;  // Yellow face
  FRONT: number;   // Green face
  BACK: number;    // Blue face
  INTERNAL: number;
}

export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  colors: CubeColors;
}

// 기본 색상 (현재 설정)
export const STANDARD_PRESET: CubeColors = {
  RIGHT: 0xC41E3A,   // Red
  LEFT: 0xFF5800,    // Orange
  TOP: 0xFFFFFF,     // White
  BOTTOM: 0xFFD500,  // Yellow
  FRONT: 0x009E60,   // Green
  BACK: 0x0051BA,    // Blue
  INTERNAL: 0x1a1a1a // Dark gray
};

// 고대비 색상 (주황/빨강 구분 강화)
export const HIGH_CONTRAST_PRESET: CubeColors = {
  RIGHT: 0xE60012,   // Deep Red (깊은 빨강)
  LEFT: 0xFF8800,    // Pure Orange (순수한 주황)
  TOP: 0xFFFFFF,     // White
  BOTTOM: 0xFFED00,  // Bright Yellow (밝은 노랑)
  FRONT: 0x00A651,   // Forest Green (진한 초록)
  BACK: 0x0047AB,    // Cobalt Blue (코발트 블루)
  INTERNAL: 0x1a1a1a // Dark gray
};

// 구분 강화 색상 (색상 구분이 어려운 사용자 고려)
export const DISTINCT_PRESET: CubeColors = {
  RIGHT: 0x8B0000,   // Dark Red (어두운 빨강)
  LEFT: 0xFF4500,    // Orange Red (주황 빨강)
  TOP: 0xFFFFFF,     // White
  BOTTOM: 0xFFD700,  // Gold (금색)
  FRONT: 0x228B22,   // Forest Green (숲 초록)
  BACK: 0x191970,    // Midnight Blue (미드나이트 블루)
  INTERNAL: 0x1a1a1a // Dark gray
};

// 선명한 색상 (모든 색상 명확히 구분)
export const VIVID_PRESET: CubeColors = {
  RIGHT: 0xDC143C,   // Crimson (크림슨)
  LEFT: 0xFF6600,    // Bright Orange (밝은 주황)
  TOP: 0xFFFFFF,     // Pure White
  BOTTOM: 0xFFD700,  // Gold Yellow (금노랑)
  FRONT: 0x228B22,   // Forest Green (숲초록)
  BACK: 0x0000CD,    // Medium Blue (중간 파랑)
  INTERNAL: 0x1a1a1a // Dark gray
};

// 매트 색상 (차분하면서도 구분 명확)
export const MATTE_PRESET: CubeColors = {
  RIGHT: 0xB22222,   // Fire Brick (화재 벽돌색)
  LEFT: 0xD2691E,    // Chocolate (초콜릿)
  TOP: 0xF5F5F5,     // White Smoke (연기 흰색)
  BOTTOM: 0xDAA520,  // Golden Rod (황금막대)
  FRONT: 0x2E8B57,   // Sea Green (바다 초록)
  BACK: 0x4682B4,    // Steel Blue (강철 파랑)
  INTERNAL: 0x1a1a1a // Dark gray
};

// 클래식 큐브 색상 (전통적인 원색)
export const CLASSIC_PRESET: CubeColors = {
  RIGHT: 0xFF0000,   // Pure Red (순수 빨강)
  LEFT: 0xFF8000,    // Orange (주황)
  TOP: 0xFFFFFF,     // Pure White (순수 흰색)
  BOTTOM: 0xFFFF00,  // Pure Yellow (순수 노랑)
  FRONT: 0x00FF00,   // Pure Green (순수 초록)
  BACK: 0x0000FF,    // Pure Blue (순수 파랑)
  INTERNAL: 0x1a1a1a // Dark gray
};

// 레트로 색상 (80년대 스타일, 명확한 구분)
export const RETRO_PRESET: CubeColors = {
  RIGHT: 0xFF1744,   // Pink Red (핑크 빨강)
  LEFT: 0xFF9800,    // Amber (호박색)
  TOP: 0xFFFFFF,     // White
  BOTTOM: 0xFFEB3B,  // Yellow (노랑)
  FRONT: 0x4CAF50,   // Green (초록)
  BACK: 0x2196F3,    // Blue (파랑)
  INTERNAL: 0x1a1a1a // Dark gray
};

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'standard',
    name: '표준',
    description: '기본 색상 설정',
    colors: STANDARD_PRESET
  },
  {
    id: 'high-contrast',
    name: '고대비',
    description: '주황/빨강 구분 강화된 색상',
    colors: HIGH_CONTRAST_PRESET
  },
  {
    id: 'distinct',
    name: '구분 강화',
    description: '색상 구분이 어려운 사용자를 위한 조합',
    colors: DISTINCT_PRESET
  },
  {
    id: 'vivid',
    name: '선명한 색상',
    description: '모든 색상이 명확히 구분되는 조합',
    colors: VIVID_PRESET
  },
  {
    id: 'matte',
    name: '매트 색상',
    description: '차분하면서도 구분 명확한 색상',
    colors: MATTE_PRESET
  },
  {
    id: 'classic',
    name: '클래식',
    description: '전통적인 원색 조합',
    colors: CLASSIC_PRESET
  },
  {
    id: 'retro',
    name: '레트로',
    description: '80년대 스타일의 명확한 색상',
    colors: RETRO_PRESET
  }
];

// 기본 프리셋 ID
export const DEFAULT_PRESET_ID = 'standard';