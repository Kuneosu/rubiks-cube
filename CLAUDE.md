# Rubik's Cube 3D Web Application

## Project Overview
Three.js 기반 3D 루빅스 큐브 시뮬레이터. React Three Fiber를 사용한 선언적 3D 씬 구성, TypeScript로 타입 안정성 확보, 큐브 중심 설계로 안정적인 조작 시스템 구현.

## Development Commands
```bash
npm run dev        # Vite 개발 서버 시작 (port 5173)
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run test       # Vitest 테스트 실행
npm run lint       # ESLint 실행
npm run type-check # TypeScript 타입 체크
```

## Architecture Principles
- **큐브 중심 설계**: 카메라 고정, 큐브 회전 방식으로 기준면 안정성 확보
- **React Three Fiber**: 선언적 3D 컴포넌트 구성
- **Zustand 상태 관리**: 큐브 상태, 타이머, 히스토리 중앙 관리
- **Command Pattern**: Undo/Redo 구현
- **6x3x3 배열**: 면별 상태 표현 (U,R,F,D,L,B 순서)

## Code Style Guidelines
- ES modules 사용 (import/export)
- React 함수형 컴포넌트만 사용
- Custom hooks로 로직 분리
- TypeScript strict mode 활성화
- 컴포넌트당 단일 책임 원칙

## Design Patterns (Stewart Smith 영감)
- **Flexible Grouping**: 임의의 큐블렛 그룹 생성 및 조작
- **Fluent Interface**: 메서드 체이닝으로 직관적 API 설계
- **Interactive Debugging**: 개발자 도구 통합으로 실시간 상태 확인
- **Modular Animation**: 독립적 애니메이션 컴포넌트 구성

## Three.js Specific Patterns
- BufferGeometry 사용 (Geometry 대신)
- 인스턴싱으로 27개 큐블렛 최적화
- WebGLRenderer 사용
- Quaternion 기반 회전
- GSAP 애니메이션 (200ms duration)
- OrbitControls로 카메라 제어

## Component Structure
```
src/
├── components/
│   ├── Cube/
│   │   ├── Cube.tsx           # 메인 큐브 컨테이너
│   │   ├── Cubelet.tsx        # 개별 큐블렛
│   │   ├── CubeController.tsx # 큐브 제어 로직
│   │   └── CubeGroup.tsx      # 큐블렛 그룹 관리
│   ├── Controls/
│   │   ├── KeyboardControls.tsx
│   │   ├── MouseControls.tsx
│   │   └── ControlPanel.tsx
│   ├── Timer/
│   │   ├── Timer.tsx
│   │   └── Statistics.tsx
│   ├── UI/
│   │   ├── HelpOverlay.tsx
│   │   └── StatusDisplay.tsx
│   └── Scene/
│       ├── Scene.tsx
│       ├── Lighting.tsx
│       └── Camera.tsx
├── hooks/
│   ├── useCubeState.ts
│   ├── useKeyboard.ts
│   ├── useAnimation.ts
│   └── useTimer.ts
├── store/
│   ├── cubeStore.ts
│   ├── timerStore.ts
│   └── historyStore.ts
├── utils/
│   ├── cubeHelpers.ts
│   ├── rotationLogic.ts
│   ├── scrambleAlgorithm.ts
│   └── constants.ts
└── types/
    └── cube.types.ts
```

## Testing Standards
- 각 컴포넌트별 단위 테스트 필수
- 큐브 회전 로직 테스트 (모든 면)
- Scramble 알고리즘 검증
- Timer 정확도 테스트
- 히스토리 관리 테스트

## Performance Requirements
- 60 FPS 유지 (requestAnimationFrame)
- 초기 로드 <3초
- 회전 애니메이션 200ms
- 메모리 사용량 <100MB

## Important Constraints
- NEVER setState in useFrame (성능 이슈)
- 회전 중 입력 차단 (isAnimating flag)
- 최소 25개 무작위 이동으로 섞기
- 히스토리 최대 1000개 제한
- 모바일 반응형 필수

## Keyboard Controls (QWEASD Layout)
```
큐브 면 회전 (QWEASD 매핑):
- Q: Front (F) 면 회전
- W: Back (B) 면 회전
- E: Right (R) 면 회전
- A: Left (L) 면 회전
- S: Down (D) 면 회전
- D: Up (U) 면 회전
- Shift + 키: 반시계방향 회전 (')

카메라 제어:
- ↑↓←→: 16-카메라 그리드 네비게이션
- 1-9: 카메라 위치 직접 점프

시스템 제어:
- Space: 스피드큐빙 타이머 / 해결 상태 분석
- T: 스피드큐빙 모드 토글
- Ctrl+Z/Y: Undo/Redo
- R: 큐브 리셋 (일반 모드에서만)
- +/-: 애니메이션 속도 조절
```

## Color Scheme
```typescript
const FACE_COLORS = {
  U: 0xFFFFFF, // White (위)
  R: 0xC41E3A, // Red (오른쪽)
  F: 0x009E60, // Green (앞)
  D: 0xFFD500, // Yellow (아래)
  L: 0xFF5800, // Orange (왼쪽)
  B: 0x0051BA  // Blue (뒤)
}
```

## Git Workflow
- Feature branch 전략
- **Commit message 규칙**: 
  - 한국어로 작성 (예: "feat: 큐브 회전 애니메이션 추가")
  - 형식: type: description
  - Claude 관련 내용 제외 (🤖 Generated with Claude Code 등)
- PR 필수 리뷰
- main branch 보호

## Commit Message Convention
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포매팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 업무 수정, 패키지 매니저 설정 등
```

## Deployment
- Vercel/Netlify 자동 배포
- 환경 변수 관리
- PWA 지원
- 오프라인 작동