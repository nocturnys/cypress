'use client'

import React, { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

const PARTICLE_COUNT = 20000
const RADIUS = 3.14
const ROTATION_SPEED = 0.01
const TWINKLE_SPEED = 5
const FOG_COLOR = new THREE.Color(0.5, 0, 0)  // Red fog color
const FOG_NEAR = 2
const FOG_FAR = 6

function Globe() {
  const points = useRef<THREE.Points>(null)
  const fogRef = useRef<THREE.Fog | null>(null)
  const { scene } = useThree()

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

  const updateFog = useCallback((elapsedTime: number) => {
    if (!fogRef.current) return
    const intensity = Math.sin(elapsedTime * 0.5) * 0.5 + 0.5
    fogRef.current.color.setRGB(FOG_COLOR.r * intensity, FOG_COLOR.g * intensity, FOG_COLOR.b * intensity)
  }, [])

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * ROTATION_SPEED
      updateColors(state.clock.elapsedTime)
    }
    updateFog(state.clock.elapsedTime)
  })

  // Create and add fog to the scene
  React.useEffect(() => {
    const fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR)
    fogRef.current = fog
    scene.fog = fog

    return () => {
      scene.fog = null
    }
  }, [scene])

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
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <Globe />
      </Canvas>
    </div>
  )
}