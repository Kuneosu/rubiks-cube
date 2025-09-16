# Rubik's Cube 3D Web Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

웹 브라우저에서 실행되는 고성능 3D 루빅스 큐브 시뮬레이터입니다. Three.js와 React를 사용하여 실제 큐브와 동일한 조작감을 제공하며, 스피드큐빙 타이머와 랭킹 시스템을 포함한 종합 플랫폼입니다.

## ✨ 주요 기능

### 🎮 직관적인 조작
- **키보드 컨트롤**: QWEASD 레이아웃 (카메라 상대적 조작)
- **마우스 컨트롤**: 드래그로 카메라 회전, 휠로 줌
- **16-카메라 그리드**: 화살표 키로 시점 전환

### ⏱️ 스피드큐빙 타이머
- 정밀한 밀리초 단위 측정
- 스페이스바 프라이밍
- 개인 기록 추적
- 완료 시 자동 기록 저장

### 🏆 랭킹 시스템
- Supabase 기반 온라인 랭킹
- 로컬 개인 기록 저장
- 실시간 전체/개인 기록 조회
- 닉네임 기반 기록 관리

### 🎲 고급 기능
- 25수 랜덤 섞기
- 무제한 Undo/Redo
- 실시간 히스토리 추적
- 카메라 상대적 회전 시스템

### 🎨 사실적인 렌더링
- 물리 기반 재질 (PBR)
- 실시간 그림자와 반사
- 둥근 모서리 디테일
- 부드러운 애니메이션 (200ms)

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행
```bash
# 저장소 클론
git clone https://github.com/Kuneosu/rubiks-cube.git
cd rubiks-cube

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 확인하세요.

### 빌드
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🎮 사용법

### 키보드 컨트롤
```
큐브 면 회전 (QWEASD 레이아웃):
Q: Front (F) 면 회전
W: Up (U) 면 회전
E: Back (B) 면 회전
A: Left (L) 면 회전
S: Down (D) 면 회전
D: Right (R) 면 회전
Shift + 키: 반시계방향 회전

카메라 제어:
↑↓←→: 16-카메라 그리드 네비게이션

시스템 제어:
Space: 스피드큐빙 타이머 / 해결 상태 분석
Tab: 스피드큐빙 모드 토글
Ctrl+Z/Y: Undo/Redo
R: 큐브 리셋 (일반 모드에서만)
,/.: 애니메이션 속도 조절
Shift + ,/.: 카메라 줌 레벨 조절
```

## 🏗️ 기술 스택

### 현재 구현 의존성 (package.json)
```json
{
  "dependencies": {
    "@react-three/fiber": "^8.15.0",  // Three.js React 통합
    "@supabase/supabase-js": "^2.57.4", // Supabase 클라이언트
    "three": "^0.159.0",               // 3D 그래픽스 엔진
    "gsap": "^3.12.0",                 // 고성능 애니메이션
    "react": "^18.2.0",                // React 18
    "react-dom": "^18.2.0",
    "dat.gui": "^0.7.9",               // 디버깅 UI
    "stats.js": "^0.17.0",             // 성능 모니터링
    "uuid": "^9.0.1"                   // 고유 ID 생성
  },
  "devDependencies": {
    "typescript": "^5.2.2",           // TypeScript 5
    "@vitejs/plugin-react": "^4.2.1", // Vite React 플러그인
    "vite": "^5.0.8",                  // 빌드 도구
    "eslint": "^8.55.0"                // 코드 품질 도구
  }
}
```

### 아키텍처 특징
- **Custom Hooks**: useState + useRef 기반 상태 관리
- **모듈식 컴포넌트**: 재사용 가능한 독립적 컴포넌트
- **TypeScript Strict**: 엄격한 타입 체크
- **GSAP 애니메이션**: Power2.inOut 이징
- **메모리 안전**: useEffect cleanup 패턴
- **Supabase 백엔드**: 실시간 랭킹 시스템
- **카메라 상대적 제어**: 16-카메라 그리드 시스템

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── CameraController.tsx    # 카메라 제어 컴포넌트
│   ├── CameraMinimap.tsx      # 카메라 미니맵
│   ├── CubeGroup.tsx          # 큐브 그룹 관리
│   ├── Lighting.tsx           # 3D 조명 설정
│   ├── Scene.tsx              # 메인 3D 씬
│   ├── ZoomControl.tsx        # 줌 컨트롤
│   └── UI/                    # 사용자 인터페이스
│       ├── RankingPanel.tsx   # 랭킹 패널
│       ├── NicknameInputModal.tsx # 닉네임 입력 모달
│       └── styles.css         # UI 스타일
├── constants/                 # 상수 정의
│   └── cameraLayout.ts       # 카메라 레이아웃
├── hooks/                     # 커스텀 React hooks
│   ├── useGridCameraNavigation.ts
│   ├── useKeyboardControls.ts
│   ├── useRubiksCube.ts
│   └── useSpeedcubeTimer.ts
├── lib/                       # 라이브러리
│   ├── supabase.ts           # Supabase 설정
│   └── rankingService.ts     # 랭킹 서비스
├── types/                     # TypeScript 타입 정의
└── utils/                     # 유틸리티 함수
    ├── cameraRelativeControls.ts
    ├── cubeGeometry.ts
    ├── cubeValidator.ts
    └── rotationSystem.ts
```

## 🧪 테스트

```bash
# 테스트 실행
npm run test

# 테스트 UI
npm run test:ui

# 커버리지 보고서
npm run test:coverage
```

## 📊 성능

### 최적화 기법
- **인스턴싱**: 27개 큐블렛 효율적 렌더링
- **Geometry 캐싱**: 메모리 사용량 최소화
- **requestAnimationFrame**: 60 FPS 유지
- **지연 로딩**: 초기 로드 시간 단축

### 성능 지표
- 초기 로드: <3초
- 애니메이션: 60 FPS
- 메모리 사용: <100MB
- 회전 지연: <16ms

## 🌐 브라우저 지원

| 브라우저 | 버전 |
|----------|------|
| Chrome   | 90+  |
| Firefox  | 88+  |
| Safari   | 14+  |
| Edge     | 90+  |

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 개발 가이드라인
자세한 개발 가이드라인은 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

## 📋 로드맵

### Phase 1 (완료)
- ✅ 기본 3D 큐브 렌더링
- ✅ QWEASD 키보드 조작
- ✅ 16-카메라 그리드 시스템
- ✅ 스피드큐빙 타이머
- ✅ 25수 랜덤 섞기
- ✅ Undo/Redo 시스템
- ✅ Supabase 랭킹 시스템
- ✅ 개인/전체 기록 관리

### Phase 2 (계획)
- 📋 모바일 최적화
- 📋 PWA 지원
- 📋 다크 모드
- 📋 추가 스크램블 알고리즘

### Phase 3 (장기 계획)
- 📋 학습 도구 (OLL/PLL)
- 📋 멀티플레이어
- 📋 AI 해법 제안
- 📋 VR/AR 모드

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Three.js](https://threejs.org/) - 3D 그래픽스 라이브러리
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - React Three.js 통합
- [World Cube Association](https://www.worldcubeassociation.org/) - 큐브 표준 및 규정
- 모든 기여자들과 큐빙 커뮤니티

## 🔗 관련 링크

- [라이브 데모](https://rubiks-cube-sandy.vercel.app/)
- [문제 신고](https://github.com/Kuneosu/rubiks-cube/issues)
- [기능 요청](https://github.com/Kuneosu/rubiks-cube/discussions)
- [소스 코드](https://github.com/Kuneosu/rubiks-cube)

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!