'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Line } from '@react-three/drei'
import * as THREE from 'three'

function Globe() {
  const points = useRef<THREE.Points>(null)
  const lines = useRef<any>(null)  // Changed to 'any' for now

  const particlesData = useMemo(() => {
    const particleCount = 20000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const radius = 3.14

    const linePositions: number[] = []

    for (let i = 0; i < particleCount; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360)
      const phi = THREE.MathUtils.randFloatSpread(360)

      const x = radius * Math.sin(theta) * Math.cos(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(theta)

      positions.set([x, y, z], i * 3)
      colors.set([9, 1, 0], i * 3) 

      linePositions.push(0, 0, 0, x, y, z)
    }

    return { positions, colors, linePositions}
  }, [])

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.05
    }
    if (lines.current) {
      lines.current.rotation.y += delta * 0.05
    }
    
    const pointsGeometry = points.current?.geometry
    if (pointsGeometry) {
      const colors = pointsGeometry.attributes.color.array as Float32Array
      
      for (let i = 0; i < colors.length; i += 3) {
        const twinkle = Math.sin(state.clock.elapsedTime * 5 + i) * 0.5 + 0.5
        colors[i] = 1 // Red
        colors[i + 1] = twinkle * 0.3 // Green
        colors[i + 2] = twinkle * 0.3 // Blue
      }
      
      pointsGeometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <>
      <Points ref={points} positions={particlesData.positions} colors={particlesData.colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <Line
        ref={lines}
        points={particlesData.linePositions}
        color="red"
        lineWidth={0.01}
        transparent
        opacity={0.2}
      />
    </>
  )
}

export default function Component() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <Globe />
      </Canvas>
    </div>
  )
}