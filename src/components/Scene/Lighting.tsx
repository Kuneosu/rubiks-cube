export default function Lighting() {
  return (
    <>
      {/* 주변광 - 전체적인 기본 조명 */}
      <ambientLight intensity={0.4} />
      
      {/* 주 방향광 - 그림자 생성 */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      {/* 보조 방향광 - 음영 완화 */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
      />
      
      {/* 포인트 라이트 - 큐브 하이라이트 */}
      <pointLight
        position={[5, 5, 5]}
        intensity={0.5}
        distance={20}
        decay={2}
      />
    </>
  );
}