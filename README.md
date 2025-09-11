# 3D Rubik's Cube Web Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

웹 브라우저에서 실행되는 고성능 3D 루빅스 큐브 시뮬레이터입니다. Three.js와 React를 사용하여 실제 큐브와 동일한 조작감을 제공하며, 스피드큐빙 타이머와 학습 도구를 포함한 종합 플랫폼입니다.

## ✨ 주요 기능

### 🎮 직관적인 조작
- **키보드 컨트롤**: 표준 큐브 표기법 (R/L/U/D/F/B)
- **마우스 컨트롤**: 드래그로 카메라 회전, 휠로 줌
- **터치 지원**: 모바일 기기 완벽 지원

### ⏱️ 스피드큐빙 타이머
- 정밀한 밀리초 단위 측정
- 스페이스바 프라이밍
- 세션별 통계 (Ao5, Ao12, Ao100)
- WCA 규정 검사 시간

### 🎲 고급 기능
- WCA 표준 25수 스크램블
- 무제한 Undo/Redo
- 실시간 히스토리 추적
- 큐브 해법 가이드

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
git clone https://github.com/your-username/rubiks-cube.git
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
기본 회전:
R, L, U, D, F, B     - 시계방향 90도 회전
Shift + 키           - 반시계방향 90도 회전
2 + 키              - 180도 회전

제어:
Space               - 타이머 시작/정지
Esc                 - 큐브 리셋
Ctrl + Z            - 실행 취소
Ctrl + Y            - 재실행
S                   - 자동 섞기
```

### 마우스 컨트롤
- **드래그**: 카메라 회전
- **휠**: 줌 인/아웃
- **더블클릭**: 카메라 리셋
- **우클릭**: 컨텍스트 메뉴

## 🏗️ 기술 스택

### 코어 기술
- **React 18** - UI 라이브러리
- **Three.js** - 3D 그래픽스 엔진
- **React Three Fiber** - Three.js React 바인딩
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구

### 상태 관리 & 유틸리티
- **Zustand** - 경량 상태 관리
- **GSAP** - 고성능 애니메이션
- **React Three Drei** - Three.js 유틸리티

### 개발 도구
- **Vitest** - 테스트 프레임워크
- **ESLint** - 코드 품질
- **Prettier** - 코드 포매팅

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Cube/           # 큐브 관련 컴포넌트
│   │   ├── Cube.tsx
│   │   ├── Cubelet.tsx
│   │   └── CubeController.tsx
│   ├── Controls/       # 입력 컨트롤
│   ├── Timer/          # 타이머 UI
│   ├── UI/             # 사용자 인터페이스
│   └── Scene/          # 3D 씬 설정
├── hooks/              # 커스텀 React hooks
├── store/              # Zustand 상태 관리
├── utils/              # 유틸리티 함수
└── types/              # TypeScript 타입 정의
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

### Phase 1 (현재)
- ✅ 기본 3D 큐브 렌더링
- ✅ 키보드/마우스 조작
- ✅ 타이머 기능
- ✅ 자동 섞기

### Phase 2 (개발 중)
- 🔄 학습 도구 (OLL/PLL)
- 🔄 모바일 최적화
- 🔄 PWA 지원
- 🔄 다크 모드

### Phase 3 (계획)
- 📋 멀티플레이어
- 📋 클라우드 동기화
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

- [라이브 데모](https://your-demo-site.com)
- [문제 신고](https://github.com/your-username/rubiks-cube/issues)
- [기능 요청](https://github.com/your-username/rubiks-cube/discussions)
- [위키](https://github.com/your-username/rubiks-cube/wiki)

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!