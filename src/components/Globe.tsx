'use client'

import React, { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

const PARTICLE_COUNT = 20000
const RADIUS = 3.14
const ROTATION_SPEED = 0.05
const TWINKLE_SPEED = 5

function Globe() {
  const points = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360)
      const phi = THREE.MathUtils.randFloatSpread(360)

      const x = RADIUS * Math.sin(theta) * Math.cos(phi)
      const y = RADIUS * Math.sin(theta) * Math.sin(phi)
      const z = RADIUS * Math.cos(theta)

      positions.set([x, y, z], i * 2)
      colors.set([1, 0, 0], i * 3) 
    }

    return { positions, colors }
  }, [])

  const updateColors = useCallback((elapsedTime: number) => {
    if (!points.current) return
    const colors = points.current.geometry.attributes.color.array as Float32Array
    
    for (let i = 0; i < colors.length; i += 3) {
      const twinkle = Math.sin(elapsedTime * TWINKLE_SPEED + i) * 0.5 + 0.5
      colors[i + 1] = twinkle * 0.3 // Green
      colors[i + 2] = twinkle * 0.3 // Blue
    }
    
    points.current.geometry.attributes.color.needsUpdate = true
  }, [])

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * ROTATION_SPEED
      updateColors(state.clock.elapsedTime)
    }
  })

  return (
    <Points ref={points} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.01}
        sizeAttenuation={true}
        depthWrite={true}
        blending={THREE.AdditiveBlending}
      />
    </Points>
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