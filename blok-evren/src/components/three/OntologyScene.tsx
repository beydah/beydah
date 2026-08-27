import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useThemePalette, type Palette } from '../../lib/theme'

/**
 * "Ne var?" sorusunun üç cevabı, yan yana.
 *
 * Üç blok da aynı; değişen tek şey hangi kısmının dolu çizildiği. Hayalet tel
 * kafes her zaman tüm bloğu gösterir — yani tartışmanın konusunu. Dolu gövde
 * ise o görüşe göre gerçekten var olanı.
 */

const HALF_T = 2.6
const W = 1.15
const D = 1.15
const GAP = 3.4
const SPEED = 0.7

export type Ontology = 'presentism' | 'growing' | 'eternalism'

export const ONTOLOGY_META: Record<
  Ontology,
  { title: string; long: string; tone: keyof Palette; offset: number }
> = {
  // title tuvale asılan kısa etiket (üçü yan yana sığmalı), long ise
  // metinlerde geçen tam ad.
  presentism: { title: 'Şimdi', long: 'Yalnızca şimdi', tone: 'd2', offset: -GAP },
  growing: { title: 'Büyüyen', long: 'Büyüyen geçmiş', tone: 'd5', offset: 0 },
  eternalism: { title: 'Hepsi', long: 'Hepsi', tone: 'd1', offset: GAP },
}

function solidExtent(kind: Ontology, now: number): { height: number; centerY: number } {
  switch (kind) {
    case 'presentism':
      return { height: 0.16, centerY: now }
    case 'growing':
      return { height: Math.max(0.16, now + HALF_T), centerY: (now - HALF_T) / 2 }
    case 'eternalism':
      return { height: HALF_T * 2, centerY: 0 }
  }
}

function OntologyBlock({
  kind,
  nowRef,
  focused,
  pal,
}: {
  kind: Ontology
  nowRef: { current: number }
  focused: boolean
  pal: Palette
}) {
  const meta = ONTOLOGY_META[kind]
  const color = pal[meta.tone]
  const solid = useRef<THREE.Mesh>(null)
  const nowMark = useRef<THREE.Group>(null)

  const ghostEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(W * 2, HALF_T * 2, D * 2)),
    [],
  )

  const nowLine = useMemo<[number, number, number][]>(
    () => [
      [-W * 1.4, 0, D * 1.06],
      [W * 1.4, 0, D * 1.06],
    ],
    [],
  )

  useFrame(() => {
    const now = nowRef.current
    const { height, centerY } = solidExtent(kind, now)
    if (solid.current) {
      solid.current.scale.y = height
      solid.current.position.y = centerY
    }
    if (nowMark.current) {
      nowMark.current.position.y = now
      nowMark.current.visible = kind !== 'eternalism'
    }
  })

  return (
    <group position={[meta.offset, 0, 0]}>
      <lineSegments geometry={ghostEdges}>
        <lineBasicMaterial color={pal.borderStrong} transparent opacity={focused ? 1 : 0.5} />
      </lineSegments>

      <mesh ref={solid}>
        <boxGeometry args={[W * 2, 1, D * 2]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={focused ? 0.55 : 0.22}
          depthWrite={false}
        />
      </mesh>

      <group ref={nowMark}>
        <Line points={nowLine} color={pal.text} lineWidth={2} transparent opacity={focused ? 0.9 : 0.4} />
      </group>

      <Html position={[0, -HALF_T - 1, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <span
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: focused ? pal.bg : pal.muted,
            background: focused ? color : 'transparent',
            padding: '3px 10px',
            borderRadius: '999px',
            border: focused ? 'none' : `1px solid ${pal.border}`,
          }}
        >
          {meta.title}
        </span>
      </Html>
    </group>
  )
}

/** Üç bloğu her ekran genişliğinde kadraja sığdırır. */
function FitCamera() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera
    const aspect = Math.max(size.width / size.height, 0.35)
    const vFov = (persp.fov * Math.PI) / 180
    const halfWidth = GAP + W + 0.7
    const halfHeight = HALF_T + 1.6
    const distW = halfWidth / (Math.tan(vFov / 2) * aspect)
    const distH = halfHeight / Math.tan(vFov / 2)
    persp.position.set(0, 1.1, Math.max(distW, distH) * 1.06)
    persp.lookAt(0, 0, 0)
    persp.updateProjectionMatrix()
  }, [camera, size])

  return null
}

function NowClock({ nowRef, playing }: { nowRef: { current: number }; playing: boolean }) {
  useFrame((_, delta) => {
    if (!playing) return
    nowRef.current += delta * SPEED
    if (nowRef.current > HALF_T) nowRef.current = -HALF_T
  })
  return null
}

export function OntologyScene({ focus, playing = true }: { focus: Ontology; playing?: boolean }) {
  const pal = useThemePalette()
  const nowRef = useRef(-HALF_T * 0.75)

  return (
    <>
      <color attach="background" args={[pal.bg]} />
      <ambientLight intensity={1} />

      <FitCamera />
      <NowClock nowRef={nowRef} playing={playing} />

      {(Object.keys(ONTOLOGY_META) as Ontology[]).map((kind) => (
        <OntologyBlock
          key={kind}
          kind={kind}
          nowRef={nowRef}
          focused={kind === focus}
          pal={pal}
        />
      ))}
    </>
  )
}
