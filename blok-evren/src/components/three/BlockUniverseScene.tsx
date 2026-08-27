import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { clampBeta } from '../../lib/relativity'

/**
 * Blok evrenin ana sahnesi.
 *
 * Eksenler: y = zaman (yukarı), x ve z = uzay. c = 1 seçildiği için ışık
 * çizgileri tam 45 derecedir — bu, ölçeklerin dürüst kalmasını sağlar.
 * "Şimdi" düzlemi t = βx + t₀ denklemiyle eğilir; kesişim noktaları farklı
 * gözlemcilerin şimdisinin blok içinde nasıl kaydığını gösterir.
 */

export const BLOCK = { x: 3, y: 4, z: 3 } as const

export interface WorldlineDef {
  id: string
  name: string
  color: string
  /** Zaman parametresinden uzay konumuna: t → [x, z] */
  path: (t: number) => [number, number]
  /** Işık ışını: 45 derecelik, blok duvarına çarpınca kesilir. */
  isLight?: boolean
  tRange?: [number, number]
}

export const WORLDLINES: WorldlineDef[] = [
  {
    id: 'you',
    name: 'Sen',
    color: '#35e0ff',
    path: (t) => [0.55 * Math.sin(t * 0.55), 0.55 * Math.cos(t * 0.55)],
  },
  {
    id: 'moon',
    name: 'Ay',
    color: '#a678ff',
    path: (t) => [1.45 * Math.sin(t * 1.15 + 1.2), 1.45 * Math.cos(t * 1.15 + 1.2)],
  },
  {
    id: 'ship',
    name: 'Gemi (β = 0,45)',
    color: '#7dffb2',
    path: (t) => [0.45 * t, -1.9],
  },
  {
    id: 'photon',
    name: 'Foton (ışık)',
    color: '#ffc46b',
    path: (t) => [t, 1.9],
    isLight: true,
    tRange: [-2.6, 2.6],
  },
]

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */

function samplePath(def: WorldlineDef, steps = 96): [number, number, number][] {
  const [t0, t1] = def.tRange ?? [-BLOCK.y, BLOCK.y]
  const points: [number, number, number][] = []
  for (let i = 0; i <= steps; i += 1) {
    const t = t0 + ((t1 - t0) * i) / steps
    const [x, z] = def.path(t)
    points.push([x, t, z])
  }
  return points
}

/**
 * "Şimdi" düzleminin bir dünya çizgisini kestiği anı bulur.
 * g(t) = t − βx(t) − t₀ = 0 denklemini tarama + ikiye bölme ile çözer.
 */
function findSliceIntersection(
  def: WorldlineDef,
  beta: number,
  sliceT: number,
): [number, number, number] | null {
  const [t0, t1] = def.tRange ?? [-BLOCK.y, BLOCK.y]
  const g = (t: number) => t - beta * def.path(t)[0] - sliceT

  const steps = 160
  let prevT = t0
  let prevG = g(t0)
  for (let i = 1; i <= steps; i += 1) {
    const t = t0 + ((t1 - t0) * i) / steps
    const cur = g(t)
    if (prevG === 0) break
    if (prevG * cur < 0) {
      // İkiye bölme ile kökü daralt
      let lo = prevT
      let hi = t
      for (let k = 0; k < 28; k += 1) {
        const mid = (lo + hi) / 2
        if (g(lo) * g(mid) <= 0) hi = mid
        else lo = mid
      }
      const root = (lo + hi) / 2
      const [x, z] = def.path(root)
      return [x, root, z]
    }
    prevT = t
    prevG = cur
  }
  return null
}

/* ------------------------------------------------------------------ */
/* Blok gövdesi                                                        */
/* ------------------------------------------------------------------ */

function SpacetimeBlock() {
  const geometry = useMemo(
    () => new THREE.BoxGeometry(BLOCK.x * 2, BLOCK.y * 2, BLOCK.z * 2),
    [],
  )
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#4a7bd0"
          transparent
          opacity={0.045}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#2f4d80" transparent opacity={0.75} />
      </lineSegments>
    </group>
  )
}

/** Blok içine serpiştirilmiş sabit olaylar — "olan biten her şey". */
function EventCloud({ count = 220 }: { count?: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    // Sabit tohum: her yüklemede aynı yıldız deseni
    let seed = 20_260_827
    const rand = () => {
      seed = (seed * 1_664_525 + 1_013_904_223) % 4_294_967_296
      return seed / 4_294_967_296
    }
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (rand() * 2 - 1) * BLOCK.x * 0.94
      positions[i * 3 + 1] = (rand() * 2 - 1) * BLOCK.y * 0.94
      positions[i * 3 + 2] = (rand() * 2 - 1) * BLOCK.z * 0.94
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [count])

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#8fa3c8"
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/* Şimdi düzlemi                                                       */
/* ------------------------------------------------------------------ */

function NowPlane({
  beta,
  sliceT,
  groupRef,
}: {
  beta: number
  sliceT: number
  groupRef?: React.Ref<THREE.Group>
}) {
  const phi = Math.atan(clampBeta(beta))
  const w = BLOCK.x * 2.16
  const d = BLOCK.z * 2.16

  const gridGeometry = useMemo(() => {
    const pts: number[] = []
    const lines = 9
    for (let i = 0; i <= lines; i += 1) {
      const u = -w / 2 + (w * i) / lines
      pts.push(u, -d / 2, 0, u, d / 2, 0)
      const v = -d / 2 + (d * i) / lines
      pts.push(-w / 2, v, 0, w / 2, v, 0)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [w, d])

  return (
    <group ref={groupRef} position={[0, sliceT, 0]} rotation={[-Math.PI / 2, 0, phi]}>
      <mesh>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial
          color="#ffc46b"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#ffc46b" transparent opacity={0.32} />
      </lineSegments>
    </group>
  )
}

/** Şimdi düzleminin dünya çizgilerini kestiği noktalar. */
function NowMarkers({
  beta,
  sliceT,
  worldlines,
}: {
  beta: number
  sliceT: number
  worldlines: WorldlineDef[]
}) {
  const group = useRef<THREE.Group>(null)

  const hits = useMemo(
    () =>
      worldlines
        .map((def) => ({ def, point: findSliceIntersection(def, beta, sliceT) }))
        .filter((h): h is { def: WorldlineDef; point: [number, number, number] } => h.point !== null),
    [worldlines, beta, sliceT],
  )

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * 0.16
    group.current?.children.forEach((child) => child.scale.setScalar(pulse))
  })

  return (
    <group ref={group}>
      {hits.map(({ def, point }) => (
        <mesh key={def.id} position={point}>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshBasicMaterial color={def.color} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Kendi kendine süpüren dilim (kahraman bölümü için).
 *
 * React durumu yerine nesneleri doğrudan günceller: her karede düzlem yükselir
 * ve kesişim işaretleri dünya çizgileri boyunca kayar.
 */
function AnimatedSlice({ beta, speed }: { beta: number; speed: number }) {
  const planeRef = useRef<THREE.Group>(null)
  const markersRef = useRef<THREE.Group>(null)
  const tRef = useRef(-BLOCK.y)

  useFrame((_, delta) => {
    tRef.current += delta * speed
    if (tRef.current > BLOCK.y) tRef.current = -BLOCK.y
    const t = tRef.current

    if (planeRef.current) planeRef.current.position.y = t

    const kids = markersRef.current?.children
    if (kids) {
      WORLDLINES.forEach((def, i) => {
        const marker = kids[i]
        if (!marker) return
        const hit = findSliceIntersection(def, beta, t)
        if (hit) {
          marker.visible = true
          marker.position.set(hit[0], hit[1], hit[2])
        } else {
          marker.visible = false
        }
      })
    }
  })

  return (
    <>
      <NowPlane beta={beta} sliceT={0} groupRef={planeRef} />
      <group ref={markersRef}>
        {WORLDLINES.map((def) => (
          <mesh key={def.id} visible={false}>
            <sphereGeometry args={[0.14, 18, 18]} />
            <meshBasicMaterial color={def.color} />
          </mesh>
        ))}
      </group>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Dünya çizgileri                                                     */
/* ------------------------------------------------------------------ */

function Worldlines({ worldlines, labels }: { worldlines: WorldlineDef[]; labels: boolean }) {
  return (
    <>
      {worldlines.map((def) => {
        const points = samplePath(def)
        const top = points[points.length - 1]
        return (
          <group key={def.id}>
            <Line
              points={points}
              color={def.color}
              lineWidth={def.isLight ? 2.4 : 2}
              dashed={def.isLight}
              dashSize={0.28}
              gapSize={0.16}
              transparent
              opacity={0.95}
            />
            {labels && (
              <Html
                position={[top[0], top[1] + 0.32, top[2]]}
                center
                distanceFactor={13}
                zIndexRange={[10, 0]}
                style={{ pointerEvents: 'none' }}
              >
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    color: def.color,
                    background: 'rgba(5,7,13,0.72)',
                    border: `1px solid ${def.color}55`,
                    borderRadius: '999px',
                    padding: '2px 8px',
                  }}
                >
                  {def.name}
                </span>
              </Html>
            )}
          </group>
        )
      })}
    </>
  )
}

/** Zaman eksenini ve yönünü gösteren ok. */
function TimeAxis() {
  const points: [number, number, number][] = [
    [-BLOCK.x - 0.9, -BLOCK.y, -BLOCK.z - 0.9],
    [-BLOCK.x - 0.9, BLOCK.y + 0.5, -BLOCK.z - 0.9],
  ]
  return (
    <group>
      <Line points={points} color="#8fa3c8" lineWidth={1.4} transparent opacity={0.7} />
      <mesh position={[-BLOCK.x - 0.9, BLOCK.y + 0.72, -BLOCK.z - 0.9]}>
        <coneGeometry args={[0.16, 0.4, 16]} />
        <meshBasicMaterial color="#8fa3c8" />
      </mesh>
      <Html
        position={[-BLOCK.x - 0.9, BLOCK.y + 1.25, -BLOCK.z - 0.9]}
        center
        distanceFactor={14}
        style={{ pointerEvents: 'none' }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            letterSpacing: '0.16em',
            color: '#8fa3c8',
            whiteSpace: 'nowrap',
          }}
        >
          ZAMAN →
        </span>
      </Html>
    </group>
  )
}

/**
 * Denetimler kapalıyken kamerayı yavaşça çevirir.
 *
 * Kahraman bölümünde OrbitControls kullanmıyoruz: tuval tüm ekranı kapladığı
 * için tek parmak sürüklemenin sayfayı kaydırmayı engellemesini istemiyoruz.
 */
function CameraRig() {
  const size = useThree((s) => s.size)

  useFrame(({ camera, clock }) => {
    const persp = camera as THREE.PerspectiveCamera
    const aspect = Math.max(size.width / size.height, 0.4)
    const vFov = (persp.fov * Math.PI) / 180
    // Bloğu her ekran oranında kadrajda tutacak uzaklık
    const distW = (BLOCK.x + 1.2) / (Math.tan(vFov / 2) * aspect)
    const distH = (BLOCK.y + 0.8) / Math.tan(vFov / 2)
    const radius = Math.max(distW, distH, 11)

    const a = clock.elapsedTime * 0.075
    persp.position.set(
      Math.sin(a) * radius,
      BLOCK.y * 0.55 + Math.sin(a * 0.7) * 0.8,
      Math.cos(a) * radius,
    )
    persp.lookAt(0, 0, 0)
  })

  return null
}

/* ------------------------------------------------------------------ */
/* Sahne                                                               */
/* ------------------------------------------------------------------ */

export interface BlockUniverseSceneProps {
  beta?: number
  sliceT?: number
  showSlice?: boolean
  showWorldlines?: boolean
  showEvents?: boolean
  showLabels?: boolean
  autoRotate?: boolean
  enableControls?: boolean
  /** > 0 ise dilim kendi kendine yükselir (birim/saniye). */
  sweepSpeed?: number
}

export function BlockUniverseScene({
  beta = 0,
  sliceT = 0,
  showSlice = true,
  showWorldlines = true,
  showEvents = true,
  showLabels = true,
  autoRotate = true,
  enableControls = true,
  sweepSpeed = 0,
}: BlockUniverseSceneProps) {
  return (
    <>
      <color attach="background" args={['#05070d']} />
      <fog attach="fog" args={['#05070d', 16, 34]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[6, 8, 6]} intensity={45} color="#7fb0ff" distance={40} />

      <SpacetimeBlock />
      {showEvents && <EventCloud />}
      {showWorldlines && <Worldlines worldlines={WORLDLINES} labels={showLabels} />}
      {showSlice &&
        (sweepSpeed > 0 ? (
          <AnimatedSlice beta={beta} speed={sweepSpeed} />
        ) : (
          <>
            <NowPlane beta={beta} sliceT={sliceT} />
            <NowMarkers beta={beta} sliceT={sliceT} worldlines={WORLDLINES} />
          </>
        ))}
      <TimeAxis />

      {!enableControls && <CameraRig />}

      {enableControls && (
        <OrbitControls
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          minDistance={8}
          maxDistance={22}
          minPolarAngle={Math.PI * 0.12}
          maxPolarAngle={Math.PI * 0.88}
          enableDamping
          dampingFactor={0.08}
        />
      )}
    </>
  )
}
