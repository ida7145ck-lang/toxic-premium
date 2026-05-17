'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei'
import { Suspense } from 'react'

function Shape() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#333"
          speed={3}
          distort={0.4}
          radius={1}
        />
      </mesh>
    </Float>
  )
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <Shape />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}
