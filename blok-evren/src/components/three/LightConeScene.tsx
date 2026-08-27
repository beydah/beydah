import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { causalRelation, type CausalRelation } from '../../lib/relativity'
import { useThemePalette, type Palette } from '../../lib/theme'

/**
 * Erişebildiğin şeylerin şekli.
 *
 * Merkezdeki nokta sensin, şu an, burada. Yukarıdaki koni bir şey
 * gönderebileceğin her yer ve her an; aşağıdaki koni sana bir şey ulaşmış
 * olabilecek her yer ve her an. Aradaki geniş boşluk — yan yana yaşadığın
 * ama o an ne ona ulaşabildiğin ne de ondan haber alabildiğin her şey.
 */

const H = 3.4 // koni yüksekliği (= yarıçapı, çünkü ışık hızı 1 alındı)

const LABEL: Record<CausalRelation, string> = {
  future: 'ULAŞABİLİRSİN',
  past: 'SANA ULAŞMIŞ OLABİLİR',
  elsewhere: 'ERİŞİLEMEZ',
  lightlike: 'TAM ZAMANINDA',
}

function relationColor(rel: CausalRelation, pal: Palette): string {
  if (rel === 'future') return pal.mint
  if (rel === 'past') return pal.d3
  if (rel === 'lightlike') return pal.d5
  return pal.clay
}

function Cone({
  direction,
  color,
  pal,
}: {
  direction: 'future' | 'past'
  color: string
  pal: Palette
}) {
  const rings = useMemo(() => {
    const out: [number, number, number][][] = []
    for (let i = 1; i <= 4; i += 1) {
      const y = (H * i) / 4
      const ring: [number, number, number][] = []
      for (let a = 0; a <= 48; a += 1) {
        const th = (a / 48) * Math.PI * 2
        ring.push([Math.cos(th) * y, direction === 'future' ? y : -y, Math.sin(th) * y])
      }
      out.push(ring)
    }
    return out
  }, [direction])

  const spokes = useMemo(() => {
    const out: [number, number, number][][] = []
    for (let a = 0; a < 8; a += 1) {
      const th = (a / 8) * Math.PI * 2
      const y = direction === 'future' ? H : -H
      out.push([
        [0, 0, 0],
        [Math.cos(th) * H, y, Math.sin(th) * H],
      ])
    }
    return out
  }, [direction])

  return (
    <group>
      <mesh
        position={[0, direction === 'future' ? H / 2 : -H / 2, 0]}
        rotation={[direction === 'future' ? Math.PI : 0, 0, 0]}
      >
        <coneGeometry args={[H, H, 48, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {rings.map((ring, i) => (
        <Line key={`r${i}`} points={ring} color={color} lineWidth={1} transparent opacity={0.4} />
      ))}
      {spokes.map((spoke, i) => (
        <Line key={`s${i}`} points={spoke} color={color} lineWidth={1.2} transparent opacity={0.55} />
      ))}
      {/* Etiketler eksenin üstünde değil yana asılı: deneme olayı çoğu zaman
          eksene yakın duruyor ve tam orada üst üste biniyorlardı. */}
      <Html
        position={[
          direction === 'future' ? H * 0.75 : -H * 0.75,
          direction === 'future' ? H + 0.15 : -H - 0.15,
          0,
        ]}
        center
        distanceFactor={9}
        style={{ pointerEvents: 'none' }}
      >
        <span
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            color: pal.bg,
            background: color,
            padding: '2px 9px',
            borderRadius: '999px',
          }}
        >
          {direction === 'future' ? 'gönderebilirsin' : 'sana ulaşmış olabilir'}
        </span>
      </Html>
    </group>
  )
}

/** Nedensel olarak kapalı bölgeyi işaretleyen yatay disk. */
function ElsewhereDisk({ pal }: { pal: Palette }) {
  const ring = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let a = 0; a <= 64; a += 1) {
      const th = (a / 64) * Math.PI * 2
      pts.push([Math.cos(th) * H * 1.5, 0, Math.sin(th) * H * 1.5])
    }
    return pts
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.02, H * 1.5, 64]} />
        <meshBasicMaterial
          color={pal.clay}
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <Line
        points={ring}
        color={pal.clay}
        lineWidth={1}
        transparent
        opacity={0.5}
        dashed
        dashSize={0.2}
        gapSize={0.14}
      />
    </group>
  )
}

/**
 * Merkezden çıkan ışık darbesi.
 *
 * Tam 45 derecede ilerler, yani her an "yarıçapı = geçen zaman" olur. Deneme
 * olayı bu darbenin önündeyse ulaşılabilir, arkasındaysa değil — koninin
 * anlamı gözle görülür hâle gelir.
 */
function LightPulse({ angle, pal }: { angle: number; pal: Palette }) {
  const mesh = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const d = ((clock.elapsedTime * 0.9) % (H * 1.15))
    if (mesh.current) mesh.current.position.set(Math.cos(angle) * d, d, Math.sin(angle) * d)
    if (ring.current) {
      ring.current.position.y = d
      ring.current.scale.setScalar(Math.max(d, 0.001))
      const mat = ring.current.material as THREE.Material
      mat.opacity = Math.max(0, 0.5 - d / (H * 1.6))
    }
  })

  return (
    <group>
      <mesh ref={mesh}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={pal.d5} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.97, 1, 48]} />
        <meshBasicMaterial color={pal.d5} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export interface LightConeSceneProps {
  probeT: number
  probeR: number
  probeAngle?: number
  autoRotate?: boolean
}

export function LightConeScene({
  probeT,
  probeR,
  probeAngle = 0.6,
  autoRotate = true,
}: LightConeSceneProps) {
  const pal = useThemePalette()
  const pos: [number, number, number] = [
    Math.cos(probeAngle) * probeR,
    probeT,
    Math.sin(probeAngle) * probeR,
  ]

  const relation = causalRelation({ t: 0, x: 0 }, { t: probeT, x: probeR }, 0.06)
  const color = relationColor(relation, pal)

  return (
    <>
      <color attach="background" args={[pal.bg]} />
      <ambientLight intensity={0.9} />

      <Cone direction="future" color={pal.mint} pal={pal} />
      <Cone direction="past" color={pal.d3} pal={pal} />
      <ElsewhereDisk pal={pal} />
      <LightPulse angle={probeAngle} pal={pal} />

      {/* Sen, şu an, burada */}
      <mesh>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshBasicMaterial color={pal.text} />
      </mesh>
      <Html position={[0, -0.45, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <span
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            color: pal.bg,
            background: pal.text,
            whiteSpace: 'nowrap',
            padding: '2px 9px',
            borderRadius: '999px',
          }}
        >
          sen · şu an
        </span>
      </Html>

      {/* Deneme olayı */}
      <group position={pos}>
        <mesh>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <Html position={[0, 0.48, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <span
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.03em',
              color: pal.bg,
              background: color,
              whiteSpace: 'nowrap',
              padding: '2px 9px',
              borderRadius: '999px',
            }}
          >
            {LABEL[relation]}
          </span>
        </Html>
      </group>

      <Line
        points={[[0, 0, 0], pos]}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.7}
        dashed={relation === 'elsewhere'}
        dashSize={0.18}
        gapSize={0.12}
      />

      <Line
        points={[
          [0, -H * 1.12, 0],
          [0, H * 1.12, 0],
        ]}
        color={pal.faint}
        lineWidth={1}
        transparent
        opacity={0.5}
      />

      <OrbitControls
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minDistance={7}
        maxDistance={20}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}
