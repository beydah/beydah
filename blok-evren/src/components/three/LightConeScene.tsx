import { useMemo } from 'react'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { causalRelation, type CausalRelation } from '../../lib/relativity'

/**
 * Işık konisi sahnesi.
 *
 * Merkezdeki olay "şimdi ve burada". c = 1 olduğu için koninin açıklığı tam
 * 45 derecedir: yükseklik ne kadarsa yarıçap da o kadar. Koninin içi nedensel
 * olarak erişilebilir, dışı ise "başka yerde" — sırası gözlemciye göre değişen,
 * blok evren tartışmasının can alıcı bölgesi.
 */

const H = 3.4 // koni yüksekliği (= yarıçapı, çünkü c = 1)

// Etiketler kısa tutuluyor: dar ekranlarda 3B etiketler tuvalden taşmasın.
// Uzun açıklama sahnenin yanındaki vurgu kutusunda.
const RELATION_STYLE: Record<CausalRelation, { color: string; label: string }> = {
  future: { color: '#35e0ff', label: 'GELECEK' },
  past: { color: '#a678ff', label: 'GEÇMİŞ' },
  elsewhere: { color: '#ff6b8b', label: 'BAŞKA YERDE' },
  lightlike: { color: '#ffc46b', label: 'IŞIKSAL' },
}

function Cone({ direction, color }: { direction: 'future' | 'past'; color: string }) {
  const rings = useMemo(() => {
    const out: [number, number, number][][] = []
    for (let i = 1; i <= 4; i += 1) {
      const y = (H * i) / 4
      const r = y
      const ring: [number, number, number][] = []
      for (let a = 0; a <= 48; a += 1) {
        const th = (a / 48) * Math.PI * 2
        ring.push([Math.cos(th) * r, direction === 'future' ? y : -y, Math.sin(th) * r])
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
          opacity={0.09}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {rings.map((ring, i) => (
        <Line key={`r${i}`} points={ring} color={color} lineWidth={1} transparent opacity={0.35} />
      ))}
      {spokes.map((spoke, i) => (
        <Line key={`s${i}`} points={spoke} color={color} lineWidth={1.2} transparent opacity={0.5} />
      ))}
    </group>
  )
}

/** "Başka yerde" bölgesini işaretleyen yatay disk. */
function ElsewhereDisk() {
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
          color="#ff6b8b"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <Line points={ring} color="#ff6b8b" lineWidth={1} transparent opacity={0.3} dashed dashSize={0.2} gapSize={0.14} />
    </group>
  )
}

export interface LightConeSceneProps {
  /** Deneme olayının zamanı (y ekseni). */
  probeT: number
  /** Deneme olayının merkezden uzaklığı. */
  probeR: number
  /** Deneme olayının yatay düzlemdeki açısı (radyan). */
  probeAngle?: number
  autoRotate?: boolean
}

export function LightConeScene({
  probeT,
  probeR,
  probeAngle = 0.6,
  autoRotate = true,
}: LightConeSceneProps) {
  const pos: [number, number, number] = [
    Math.cos(probeAngle) * probeR,
    probeT,
    Math.sin(probeAngle) * probeR,
  ]

  const relation = causalRelation({ t: 0, x: 0 }, { t: probeT, x: probeR }, 0.06)
  const style = RELATION_STYLE[relation]

  return (
    <>
      <color attach="background" args={['#05070d']} />
      <ambientLight intensity={0.8} />

      <Cone direction="future" color="#35e0ff" />
      <Cone direction="past" color="#a678ff" />
      <ElsewhereDisk />

      {/* Merkezdeki olay: şimdi ve burada */}
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#e8eefc" />
      </mesh>
      <Html position={[0, -0.42, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: '#e8eefc',
            whiteSpace: 'nowrap',
            background: 'rgba(5,7,13,0.75)',
            padding: '2px 8px',
            borderRadius: '999px',
            border: '1px solid #1d2942',
          }}
        >
          şimdi · burada
        </span>
      </Html>

      {/* Deneme olayı */}
      <group position={pos}>
        <mesh>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshBasicMaterial color={style.color} />
        </mesh>
        <Html position={[0, 0.45, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10.5px',
              color: style.color,
              whiteSpace: 'nowrap',
              background: 'rgba(5,7,13,0.8)',
              padding: '3px 9px',
              borderRadius: '999px',
              border: `1px solid ${style.color}66`,
            }}
          >
            {style.label}
          </span>
        </Html>
      </group>

      {/* Merkez ile deneme olayı arasındaki bağ */}
      <Line
        points={[
          [0, 0, 0],
          pos,
        ]}
        color={style.color}
        lineWidth={1.6}
        transparent
        opacity={0.55}
        dashed={relation === 'elsewhere'}
        dashSize={0.18}
        gapSize={0.12}
      />

      {/* Zaman ekseni */}
      <Line
        points={[
          [0, -H * 1.12, 0],
          [0, H * 1.12, 0],
        ]}
        color="#8fa3c8"
        lineWidth={1}
        transparent
        opacity={0.4}
      />

      <OrbitControls
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
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
