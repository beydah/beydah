import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { useInView } from '../../hooks/useInView'

interface SceneFrameProps {
  children: ReactNode
  /** Kamera başlangıç konumu. */
  camera?: [number, number, number]
  fov?: number
  /** Tailwind yükseklik sınıfı — mobil öncelikli varsayılan. */
  heightClass?: string
  label: string
  overlay?: ReactNode
}

/**
 * WebGL tuvalini yalnızca ekranda göründüğünde canlı tutan çerçeve.
 *
 * Tuval bir kez göründükten sonra DOM'da kalır ama ekrandan çıkınca
 * `frameloop="never"` ile donar; böylece sayfadaki beş 3B sahne aynı anda
 * telefonun GPU'sunu tüketmez.
 */
export function SceneFrame({
  children,
  camera = [7, 5.5, 9],
  fov = 45,
  heightClass = 'h-[46vh] min-h-[280px] max-h-[520px] md:h-[60vh]',
  label,
  overlay,
}: SceneFrameProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '220px' })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (inView) setMounted(true)
  }, [inView])

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-2xl border border-line bg-surface-2 ${heightClass}`}
      role="img"
      aria-label={label}
    >
      {mounted && (
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 1.75]}
          camera={{ position: camera, fov, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      )}
      {!mounted && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="font-mono text-[0.72rem] tracking-wider text-muted">yükleniyor…</div>
        </div>
      )}
      {overlay}
    </div>
  )
}
