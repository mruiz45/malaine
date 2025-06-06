/**
 * 3D Garment Scene Component (PD_PH5_US001)
 * Renders the 3D scene with garment meshes using React Three Fiber
 */

'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { 
  FinishedDimensions, 
  MeshConfiguration, 
  CameraViewPreset, 
  GarmentType, 
  NecklineParams, 
  SleeveParams, 
  SceneConfiguration 
} from '@/types/3d-preview';

/**
 * Simple box component for garment parts
 */
function GarmentBox({ 
  position, 
  size, 
  color 
}: { 
  position: [number, number, number]; 
  size: [number, number, number]; 
  color: string; 
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/**
 * Scene content
 */
function SceneContent({
  garmentType,
  dimensions,
  neckline,
  sleeves,
  meshConfig,
  currentView
}: {
  garmentType: GarmentType;
  dimensions: FinishedDimensions;
  neckline: NecklineParams;
  sleeves: SleeveParams;
  meshConfig: MeshConfiguration;
  currentView: CameraViewPreset;
}) {
  // Convert to 3D coordinates
  const bodyWidth = dimensions.bust / 100;
  const bodyHeight = dimensions.length / 100;
  const bodyDepth = bodyWidth * 0.4;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />

      {/* Front body */}
      {meshConfig.visibility.frontBody && (
        <GarmentBox
          position={[0, 0, bodyDepth / 4]}
          size={[bodyWidth, bodyHeight, bodyDepth / 2]}
          color={meshConfig.colors.frontBody}
        />
      )}

      {/* Back body */}
      {meshConfig.visibility.backBody && (
        <GarmentBox
          position={[0, 0, -bodyDepth / 4]}
          size={[bodyWidth, bodyHeight, bodyDepth / 2]}
          color={meshConfig.colors.backBody}
        />
      )}

      {/* Sleeves */}
      {sleeves.enabled && dimensions.sleeveLength && (
        <>
          {/* Left sleeve */}
          {meshConfig.visibility.leftSleeve && (
            <GarmentBox
              position={[-(bodyWidth / 2 + bodyWidth * 0.15), bodyHeight / 4, 0]}
              size={[bodyWidth * 0.3, bodyWidth * 0.3, dimensions.sleeveLength / 100]}
              color={meshConfig.colors.leftSleeve}
            />
          )}

          {/* Right sleeve */}
          {meshConfig.visibility.rightSleeve && (
            <GarmentBox
              position={[bodyWidth / 2 + bodyWidth * 0.15, bodyHeight / 4, 0]}
              size={[bodyWidth * 0.3, bodyWidth * 0.3, dimensions.sleeveLength / 100]}
              color={meshConfig.colors.rightSleeve}
            />
          )}
        </>
      )}

      {/* Neckline detail */}
      {meshConfig.visibility.necklineDetail && neckline.type !== 'crew' && (
        <GarmentBox
          position={[0, bodyHeight / 2 - bodyHeight * 0.075, bodyDepth / 8]}
          size={[bodyWidth * 0.6, bodyHeight * 0.15, bodyDepth * 0.1]}
          color={meshConfig.colors.necklineDetail}
        />
      )}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={10}
      />
    </>
  );
}

/**
 * Loading fallback
 */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e5e7eb" wireframe />
    </mesh>
  );
}

/**
 * Main GarmentScene component
 */
interface GarmentSceneProps {
  garmentType: GarmentType;
  dimensions: FinishedDimensions;
  neckline: NecklineParams;
  sleeves: SleeveParams;
  meshConfig: MeshConfiguration;
  sceneConfig: SceneConfiguration;
  currentView: CameraViewPreset;
  className?: string;
}

export default function GarmentScene({
  garmentType,
  dimensions,
  neckline,
  sleeves,
  meshConfig,
  sceneConfig,
  currentView,
  className = ''
}: GarmentSceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [2, 1, 2], fov: 50 }}
        style={{ 
          background: sceneConfig.backgroundColor,
          width: '100%',
          height: '100%'
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SceneContent
            garmentType={garmentType}
            dimensions={dimensions}
            neckline={neckline}
            sleeves={sleeves}
            meshConfig={meshConfig}
            currentView={currentView}
          />
        </Suspense>
      </Canvas>
    </div>
  );
} 