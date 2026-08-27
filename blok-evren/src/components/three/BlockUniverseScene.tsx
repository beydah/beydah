import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { clampBeta } from '../../lib/relativity'
import { useThemePalette, type Palette } from '../../lib/theme'
import { BLOCK, WORLDLINES, findSliceIntersection, type WorldlineDef } from '../../lib/worldlines'

/**
 * Bir günün, bir bütün olarak görüntüsü.
 *
 * Dikey eksen o günün saatleri, yatay eksenler ise mekân. İçindeki eğriler
 * insanların gün boyunca izlediği yollar. Yeşil düzlem birinin "şimdi"si:
 * t = βx + t₀ denklemiyle eğilir ve eğildikçe, aynı anda olduğunu sandığın
 * şeyler birbirinden ayrılır.
 */

export { BLOCK }

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

/* ------------------------------------------------------------------ */
/* Blok gövdesi                                                        */
/* ------------------------------------------------------------------ */

function SpacetimeBlock({ pal }: { pal: Palette }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(BLOCK.x * 2, BLOCK.y * 2, BLOCK.z * 2), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry])

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={pal.borderStrong}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={pal.borderStrong} transparent opacity={0.95} />
      </lineSegments>
    </group>
  )
}

/** Blok içine serpiştirilmiş olaylar — o gün olup biten her şey. */
function EventCloud({ pal, count = 200 }: { pal: Palette; count?: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
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
        color={pal.faint}
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.6}
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
  pal,
  groupRef,
}: {
  beta: number
  sliceT: number
  pal: Palette
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
          color={pal.mintBright}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color={pal.mintBright} transparent opacity={0.45} />
      </lineSegments>
    </group>
  )
}

function NowMarkers({
  beta,
  sliceT,
  pal,
}: {
  beta: number
  sliceT: number
  pal: Palette
}) {
  const group = useRef<THREE.Group>(null)

  const hits = useMemo(
    () =>
      WORLDLINES.map((def) => ({ def, point: findSliceIntersection(def, beta, sliceT) })).filter(
        (h): h is { def: WorldlineDef; point: [number, number, number] } => h.point !== null,
      ),
    [beta, sliceT],
  )

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.14
    group.current?.children.forEach((child) => child.scale.setScalar(pulse))
  })

  return (
    <group ref={group}>
      {hits.map(({ def, point }) => (
        <mesh key={def.id} position={point}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshBasicMaterial color={pal[def.tone]} />
        </mesh>
      ))}
    </group>
  )
}

/** Kahraman bölümü için kendi kendine yükselen dilim. */
function AnimatedSlice({ beta, speed, pal }: { beta: number; speed: number; pal: Palette }) {
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
      <NowPlane beta={beta} sliceT={0} pal={pal} groupRef={planeRef} />
      <group ref={markersRef}>
        {WORLDLINES.map((def) => (
          <mesh key={def.id} visible={false}>
            <sphereGeometry args={[0.14, 18, 18]} />
            <meshBasicMaterial color={pal[def.tone]} />
          </mesh>
        ))}
      </group>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Dünya çizgileri                                                     */
/* ------------------------------------------------------------------ */

function Worldlines({ pal, labels }: { pal: Palette; labels: boolean }) {
  return (
    <>
      {WORLDLINES.map((def) => {
        const points = samplePath(def)
        // Etiket, çizginin tepesine değil kendi labelT'sine asılır —
        // dört etiket böylece farklı yüksekliklere dağılır.
        const [lx, lz] = def.path(def.labelT)
        const color = pal[def.tone]
        return (
          <group key={def.id}>
            <Line
              points={points}
              color={color}
              lineWidth={def.isLight ? 2.2 : 2.6}
              dashed={def.isLight}
              dashSize={0.28}
              gapSize={0.16}
            />
            {labels && (
              <Html
                position={[lx, def.labelT + 0.3, lz]}
                center
                distanceFactor={11}
                zIndexRange={[10, 0]}
                style={{ pointerEvents: 'none' }}
              >
                <span
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    color: pal.bg,
                    background: color,
                    borderRadius: '999px',
                    padding: '2px 9px',
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

/**
 * Zaman eksenini ve yönünü gösteren ok.
 *
 * Saat yazıları bilerek yok: dönen bir sahnede metin etiketleri hem üstteki
 * bilgi rozetiyle hem birbirleriyle çakışıyordu. Saat aralığı zaten sahnenin
 * altındaki açıklamada ve kaydırıcıda yazıyor.
 */
function TimeAxis({ pal }: { pal: Palette }) {
  const x = -BLOCK.x - 0.9
  const z = -BLOCK.z - 0.9

  return (
    <group>
      <Line
        points={[
          [x, -BLOCK.y, z],
          [x, BLOCK.y + 0.5, z],
        ]}
        color={pal.faint}
        lineWidth={1.6}
      />
      <mesh position={[x, BLOCK.y + 0.72, z]}>
        <coneGeometry args={[0.16, 0.4, 16]} />
        <meshBasicMaterial color={pal.faint} />
      </mesh>
    </group>
  )
}

/**
 * Denetimler kapalıyken kamerayı yavaşça çevirir ve bloğu kadrajda tutar.
 * Kahraman bölümünde OrbitControls yok: tuval tüm ekranı kapladığı için tek
 * parmak sürüklemenin sayfa kaydırmayı çalmasını istemiyoruz.
 */
function CameraRig() {
  const size = useThree((s) => s.size)

  useFrame(({ camera, clock }) => {
    const persp = camera as THREE.PerspectiveCamera
    const aspect = Math.max(size.width / size.height, 0.4)
    const vFov = (persp.fov * Math.PI) / 180
    const distW = (BLOCK.x + 1.2) / (Math.tan(vFov / 2) * aspect)
    const distH = (BLOCK.y + 0.8) / Math.tan(vFov / 2)
    const radius = Math.max(distW, distH, 11)

    const a = clock.elapsedTime * 0.07
    persp.position.set(
      Math.sin(a) * radius,
      BLOCK.y * 0.5 + Math.sin(a * 0.7) * 0.7,
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
  const pal = useThemePalette()

  return (
    <>
      <color attach="background" args={[pal.bg]} />
      <ambientLight intensity={0.9} />

      <SpacetimeBlock pal={pal} />
      {showEvents && <EventCloud pal={pal} />}
      {showWorldlines && <Worldlines pal={pal} labels={showLabels} />}
      {showSlice &&
        (sweepSpeed > 0 ? (
          <AnimatedSlice beta={beta} speed={sweepSpeed} pal={pal} />
        ) : (
          <>
            <NowPlane beta={beta} sliceT={sliceT} pal={pal} />
            <NowMarkers beta={beta} sliceT={sliceT} pal={pal} />
          </>
        ))}
      <TimeAxis pal={pal} />

      {!enableControls && <CameraRig />}

      {enableControls && (
        <OrbitControls
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.45}
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
