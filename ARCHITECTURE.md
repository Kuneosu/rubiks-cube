# 기술 아키텍처 문서

## 시스템 개요

### 핵심 아키텍처 결정
- **큐브 중심 설계**: 카메라 고정 + 큐브 회전 방식으로 안정적인 기준 축 유지
- **React Three Fiber**: Three.js의 React 통합으로 선언적 3D 개발
- **TypeScript**: 타입 안정성과 개발 생산성 향상
- **Zustand**: 경량 상태 관리로 성능 최적화

## 데이터 구조

### Stewart Smith 영감 설계 패턴
```typescript
// Flexible Grouping System (Stewart Smith 스타일)
interface CubeGroup {
  id: string;
  cubelets: Cubelet[];
  canRotate: boolean;
  
  // Fluent Interface 패턴
  rotate(face: Face): this;
  highlight(): this;
  explode(radius?: number): this;
  reset(): this;
}

// Prototypal-style 확장성
interface CubeExplorer {
  createGroup(selector: (cubelet: Cubelet) => boolean): CubeGroup;
  debugMode(enabled: boolean): this;
  visualizeRotations(): this;
}
```

### 큐브 상태 표현
```typescript
// 6x3x3 배열 구조
type CubeState = number[][][]; // [face][row][col]

// 면 인덱스
enum Face {
  U = 0, // Up (White)
  R = 1, // Right (Red)
  F = 2, // Front (Green)
  D = 3, // Down (Yellow)
  L = 4, // Left (Orange)
  B = 5  // Back (Blue)
}

// 색상 인덱스
enum Color {
  WHITE = 0,
  RED = 1,
  GREEN = 2,
  YELLOW = 3,
  ORANGE = 4,
  BLUE = 5
}
```

### 큐블렛 위치 시스템
```typescript
interface CubeletPosition {
  x: -1 | 0 | 1; // Left-Center-Right
  y: -1 | 0 | 1; // Bottom-Center-Top
  z: -1 | 0 | 1; // Back-Center-Front
}

interface Cubelet {
  id: string;
  position: CubeletPosition;
  rotation: THREE.Quaternion;
  type: 'corner' | 'edge' | 'center';
  faces: FaceColor[];
}
```

## 상태 관리 아키텍처

### Zustand Store 구조
```typescript
// 큐브 상태 스토어
interface CubeStore {
  // State
  cubeState: CubeState;
  isAnimating: boolean;
  animationQueue: Move[];
  
  // Actions
  rotateFace: (face: Face, direction: Direction) => void;
  scramble: () => void;
  reset: () => void;
  queueMove: (move: Move) => void;
  processQueue: () => void;
}

// 히스토리 스토어
interface HistoryStore {
  // State
  history: Move[];
  currentIndex: number;
  maxHistory: number;
  
  // Actions
  addMove: (move: Move) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

// 타이머 스토어
interface TimerStore {
  // State
  startTime: number | null;
  currentTime: number;
  isRunning: boolean;
  isPriming: boolean;
  sessions: Session[];
  
  // Actions
  start: () => void;
  stop: () => void;
  reset: () => void;
  prime: () => void;
  addSession: (time: number) => void;
}
```

## 회전 시스템

### 회전 매트릭스
```typescript
class RotationMatrix {
  // 면 회전 매트릭스 정의
  private static matrices = {
    U: [
      [0, 0, 1], // x' = z
      [0, 1, 0], // y' = y
      [-1, 0, 0] // z' = -x
    ],
    R: [
      [1, 0, 0],  // x' = x
      [0, 0, -1], // y' = -z
      [0, 1, 0]   // z' = y
    ],
    // F, D, L, B 매트릭스...
  };
  
  static applyRotation(
    position: CubeletPosition,
    face: Face,
    direction: Direction
  ): CubeletPosition {
    const matrix = this.getMatrix(face, direction);
    return this.multiplyMatrix(position, matrix);
  }
}
```

### 애니메이션 시스템
```typescript
class AnimationManager {
  private gsapTimeline: gsap.core.Timeline;
  
  animateRotation(
    group: THREE.Group,
    axis: THREE.Vector3,
    angle: number,
    duration: number = 0.2
  ): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(group.rotation, {
        duration,
        ease: "power2.inOut",
        onUpdate: () => {
          group.rotateOnWorldAxis(axis, angle);
        },
        onComplete: resolve
      });
    });
  }
}
```

## 컴포넌트 아키텍처

### 컴포넌트 계층 구조
```
<App>
  <Canvas>
    <Scene>
      <PerspectiveCamera />
      <OrbitControls />
      <Lighting />
      <CubeContainer>
        <CubeGroup>
          {cubelets.map(cubelet => 
            <Cubelet key={cubelet.id} {...cubelet} />
          )}
        </CubeGroup>
      </CubeContainer>
      <EffectComposer />
    </Scene>
  </Canvas>
  <UI>
    <ControlPanel />
    <Timer />
    <History />
    <Settings />
  </UI>
</App>
```

### 핵심 컴포넌트 책임

#### CubeContainer
- 큐브 전체 상태 관리
- 회전 명령 처리
- 애니메이션 큐 관리

#### CubeGroup
- 27개 큐블렛 그룹핑
- 임시 회전 그룹 생성
- 좌표 정규화

#### Cubelet
- 개별 큐블렛 렌더링
- 6면 색상 관리
- 메쉬 최적화

## 성능 최적화 전략

### 렌더링 최적화
```typescript
// 인스턴싱 사용
function OptimizedCubelets() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  useLayoutEffect(() => {
    for (let i = 0; i < 27; i++) {
      tempObject.position.copy(getCubeletPosition(i));
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  
  return (
    <instancedMesh ref={meshRef} args={[null, null, 27]}>
      <roundedBoxGeometry args={[0.9, 0.9, 0.9, 2, 0.08]} />
      <meshPhysicalMaterial />
    </instancedMesh>
  );
}
```

### 메모리 관리
```typescript
// Geometry/Material 재사용
const geometryCache = new Map<string, THREE.BufferGeometry>();
const materialCache = new Map<number, THREE.Material>();

function getCachedGeometry(key: string): THREE.BufferGeometry {
  if (!geometryCache.has(key)) {
    geometryCache.set(key, createGeometry(key));
  }
  return geometryCache.get(key)!;
}
```

### 애니메이션 최적화
```typescript
// RAF 기반 업데이트
function useAnimationFrame(callback: (delta: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);
}
```

## 입력 처리

### 키보드 입력 시스템 (Singmaster + Stewart Smith 확장)
```typescript
class InputManager {
  private keyMap = new Map<string, () => void>();
  private modifiers = {
    shift: false,
    ctrl: false,
    alt: false,
    num2: false
  };
  
  constructor(private cubeStore: CubeStore) {
    this.setupKeyBindings();
  }
  
  private setupKeyBindings() {
    // Singmaster 표준 표기법
    this.keyMap.set('R', () => this.cubeStore.rotateFace('R', 1));
    this.keyMap.set('L', () => this.cubeStore.rotateFace('L', 1));
    this.keyMap.set('U', () => this.cubeStore.rotateFace('U', 1));
    this.keyMap.set('D', () => this.cubeStore.rotateFace('D', 1));
    this.keyMap.set('F', () => this.cubeStore.rotateFace('F', 1));
    this.keyMap.set('B', () => this.cubeStore.rotateFace('B', 1));
    
    // Stewart Smith 스타일 (소문자 = 반시계방향)
    this.keyMap.set('r', () => this.cubeStore.rotateFace('R', -1));
    this.keyMap.set('l', () => this.cubeStore.rotateFace('L', -1));
    this.keyMap.set('u', () => this.cubeStore.rotateFace('U', -1));
    this.keyMap.set('d', () => this.cubeStore.rotateFace('D', -1));
    this.keyMap.set('f', () => this.cubeStore.rotateFace('F', -1));
    this.keyMap.set('b', () => this.cubeStore.rotateFace('B', -1));
    
    // 중간층 회전
    this.keyMap.set('M', () => this.cubeStore.rotateFace('M', 1));
    this.keyMap.set('E', () => this.cubeStore.rotateFace('E', 1));
    this.keyMap.set('S', () => this.cubeStore.rotateFace('S', 1));
    
    // 큐브 전체 회전
    this.keyMap.set('x', () => this.cubeStore.rotateCube('x', 1));
    this.keyMap.set('y', () => this.cubeStore.rotateCube('y', 1));
    this.keyMap.set('z', () => this.cubeStore.rotateCube('z', 1));
  }
  
  handleKeyDown(event: KeyboardEvent) {
    if (this.cubeStore.isAnimating) return;
    
    const key = this.getKeyWithModifiers(event);
    const action = this.keyMap.get(key);
    if (action) action();
  }
}
```

### 마우스/터치 처리
```typescript
interface GestureHandler {
  onSwipeLeft: (velocity: number) => void;
  onSwipeRight: (velocity: number) => void;
  onSwipeUp: (velocity: number) => void;
  onSwipeDown: (velocity: number) => void;
  onPinch: (scale: number) => void;
  onRotate: (angle: number) => void;
}
```

## 알고리즘

### 섞기 알고리즘
```typescript
class ScrambleGenerator {
  private moves = ['R', 'L', 'U', 'D', 'F', 'B'];
  private modifiers = ['', "'", '2'];
  
  generate(length: number = 25): string[] {
    const scramble: string[] = [];
    let lastMove = '';
    let lastAxis = '';
    
    for (let i = 0; i < length; i++) {
      let move = this.getRandomMove();
      
      // 같은 면 연속 방지
      while (move[0] === lastMove[0]) {
        move = this.getRandomMove();
      }
      
      // 반대 면 연속 3회 방지
      const axis = this.getAxis(move[0]);
      if (axis === lastAxis && this.isOppositeFace(move[0], lastMove[0])) {
        move = this.getRandomMove();
      }
      
      scramble.push(move);
      lastMove = move;
      lastAxis = axis;
    }
    
    return scramble;
  }
}
```

### 해결 감지
```typescript
class SolutionDetector {
  static isSolved(cubeState: CubeState): boolean {
    for (let face = 0; face < 6; face++) {
      const centerColor = cubeState[face][1][1];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (cubeState[face][row][col] !== centerColor) {
            return false;
          }
        }
      }
    }
    return true;
  }
}
```

## 테스트 전략

### 단위 테스트
```typescript
describe('CubeRotation', () => {
  test('R move rotates correct cubelets', () => {
    const cube = new CubeState();
    cube.rotateFace('R', 1);
    expect(cube.getFace('R')).toMatchSnapshot();
  });
  
  test('Opposite moves cancel out', () => {
    const initial = new CubeState();
    const cube = new CubeState();
    cube.rotateFace('R', 1);
    cube.rotateFace('R', -1);
    expect(cube.state).toEqual(initial.state);
  });
});
```

### 통합 테스트
```typescript
describe('CubeInteraction', () => {
  test('Scramble and solve workflow', async () => {
    const { cube, timer } = await setupCube();
    
    await cube.scramble();
    expect(cube.isSolved()).toBe(false);
    
    timer.start();
    // 해결 시뮬레이션
    await solveCube(cube);
    
    expect(cube.isSolved()).toBe(true);
    expect(timer.isRunning).toBe(false);
  });
});
```

## 보안 고려사항

### 입력 검증
- 모든 사용자 입력 sanitize
- 알고리즘 입력 길이 제한
- XSS 방지

### 데이터 보호
- 로컬 스토리지 암호화
- 세션 데이터 격리
- API 통신 HTTPS 강제

## 확장성 고려사항

### 모듈화
- 컴포넌트 독립성 유지
- 플러그인 아키텍처 지원
- 테마/스킨 시스템

### 국제화
- i18n 지원
- RTL 레이아웃
- 다국어 UI

### 미래 기능
- 4x4x4, 5x5x5 큐브 지원
- VR/AR 모드
- AI 해법 제안
- 실시간 멀티플레이어

## Stewart Smith 영감 고급 기능

### 디버깅 및 개발 도구
```typescript
// 실시간 상태 시각화 (개발자 도구 통합)
class CubeDebugger {
  enableInspection() {
    // 브라우저 개발자 도구와 연동
    this.injectDebugAttributes();
    this.enableLiveEditing();
  }
  
  visualizeRotationPaths() {
    // 회전 경로 시각화
    this.showAnimationPaths();
    this.highlightAffectedCubelets();
  }
  
  exploreGroupings() {
    // 유연한 큐블렛 그룹핑 탐색
    this.createArbitraryGroups();
    this.testRotationPatterns();
  }
}
```

### Fluent Interface API
```typescript
// Stewart Smith 스타일 체이닝 API
class ModernCubeExplorer {
  // 메서드 체이닝으로 직관적 조작
  cube
    .selectFace('F')
    .highlight()
    .rotate(90)
    .explode(1.5)
    .wait(1000)
    .reset()
    .selectCorners()
    .rainbow()
    .shuffle();
    
  // 실험적 기능
  cube
    .debugMode(true)
    .showWireframes()
    .hidePlastics()
    .visualizeAlgorithm('R U R\' U\'');
}