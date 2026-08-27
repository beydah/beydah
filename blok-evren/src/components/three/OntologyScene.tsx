import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Zamanın üç ontolojisini yan yana gösteren sahne.
 *
 * Aynı blok üç kez çizilir; değişen tek şey "var olan" bölgedir. Hayalet tel
 * kafes her zaman tüm bloğu gösterir, dolu gövde ise o görüşe göre gerçekten
 * var olanı. "Şimdi" çizgisi yukarı doğru ilerler; şimdicilikte ince dilim
 * kayar, büyüyen blokta gövde uzar, eternalizmde hiçbir şey değişmez.
 */

const HALF_T = 2.6
const W = 1.15
const D = 1.15
const GAP = 3.4
const SPEED = 0.7 // birim / saniye

export type Ontology = 'presentism' | 'growing' | 'eternalism'

export const ONTOLOGY_META: Record<
  Ontology,
  { title: string; color: string; blurb: string; offset: number }
> = {
  presentism: {
    title: 'Şimdicilik',
    color: '#ff6b8b',
    blurb: 'Yalnızca şu an var. Geçmiş bitti, gelecek henüz yok.',
    offset: -GAP,
  },
  growing: {
    title: 'Büyüyen Blok',
    color: '#ffc46b',
    blurb: 'Geçmiş ve şimdi var, gelecek henüz yazılmadı. Blok büyüyor.',
    offset: 0,
  },
  eternalism: {
    title: 'Eternalizm',
    color: '#35e0ff',
    blurb: 'Geçmiş, şimdi ve gelecek eşit derecede gerçek. Blok bütün.',
    offset: GAP,
  },
}

/** Verilen görüşe göre "var olan" bölgenin yüksekliği ve merkezi. */
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
}: {
  kind: Ontology
  nowRef: { current: number }
  focused: boolean
}) {
  const meta = ONTOLOGY_META[kind]
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

  // React state yerine doğrudan nesneleri güncelliyoruz: her karede
  // yeniden render etmeden 60 fps.
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
        <lineBasicMaterial color="#2f4d80" transparent opacity={focused ? 0.75 : 0.32} />
      </lineSegments>

      {/* Birim yükseklikli kutu; ölçek her karede ayarlanıyor. */}
      <mesh ref={solid}>
        <boxGeometry args={[W * 2, 1, D * 2]} />
        <meshStandardMaterial
          color={meta.color}
          transparent
          opacity={focused ? 0.4 : 0.15}
          emissive={meta.color}
          emissiveIntensity={focused ? 0.6 : 0.2}
          roughness={0.4}
          depthWrite={false}
        />
      </mesh>

      <group ref={nowMark}>
        <Line
          points={nowLine}
          color="#e8eefc"
          lineWidth={2}
          transparent
          opacity={focused ? 0.95 : 0.45}
        />
      </group>

      <Html position={[0, -HALF_T - 1, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: focused ? meta.color : '#8fa3c8',
            background: 'rgba(5,7,13,0.78)',
            padding: '3px 10px',
            borderRadius: '999px',
            border: `1px solid ${focused ? `${meta.color}66` : '#1d2942'}`,
          }}
        >
          {meta.title}
        </span>
      </Html>
    </group>
  )
}

/**
 * Üç bloğu her ekran genişliğinde kadraja sığdırır.
 *
 * Bu sahnede OrbitControls yok: karşılaştırma görünümü döndürmeye ihtiyaç
 * duymuyor ve tuval telefonda tek parmak kaydırmayı çalmamalı.
 */
function FitCamera() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera
    const aspect = Math.max(size.width / size.height, 0.35)
    const vFov = (persp.fov * Math.PI) / 180
    // Sığdırılacak yarı ölçüler: yanlarda üçüncü bloğun kenarı, altta etiketler
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
  const nowRef = useRef(-HALF_T * 0.75)

  return (
    <>
      <color attach="background" args={['#05070d']} />
      <ambientLight intensity={0.75} />
      <pointLight position={[4, 6, 6]} intensity={60} color="#a9c8ff" distance={34} />

      <FitCamera />
      <NowClock nowRef={nowRef} playing={playing} />

      {(Object.keys(ONTOLOGY_META) as Ontology[]).map((kind) => (
        <OntologyBlock key={kind} kind={kind} nowRef={nowRef} focused={kind === focus} />
      ))}
    </>
  )
}
