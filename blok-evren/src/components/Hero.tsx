import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'motion/react'
import { BlockUniverseScene } from './three/BlockUniverseScene'

/**
 * Açılış bölümü.
 *
 * Arka planda blok kendi kendine döner ve "şimdi" dilimi yavaşça yükselir —
 * sayfanın bütün tezi tek bir görüntüde. Tuvalde OrbitControls yok, böylece
 * telefonda ilk dokunuş sayfayı kaydırmaya devam eder.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-14 md:justify-center md:pb-0">
      {/* Arka plan sahnesi */}
      <div className="absolute inset-0 grid-fade opacity-90">
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [9, 5.5, 11], fov: 44 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <BlockUniverseScene
              beta={0.38}
              sweepSpeed={0.85}
              showLabels={false}
              enableControls={false}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Okunabilirlik için degrade perde */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/25 md:bg-gradient-to-r md:from-void md:via-void/80 md:to-transparent" />

      <div className="shell relative">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="eyebrow mb-4">Özel görelilik · Zaman felsefesi</p>
          <h1 className="text-[2.6rem] leading-[1.05] font-semibold sm:text-[3.4rem] md:text-[4.2rem]">
            Zaman akmıyor.
            <br />
            <span className="text-cyan-glow text-glow-cyan">Sen akıyorsun.</span>
          </h1>
          <p className="prose-lead mt-5 max-w-xl text-[1.02rem] md:text-lg">
            Geçmiş bitmedi, gelecek de henüz yazılmamış değil — ikisi de{' '}
            <em className="text-chalk not-italic">şu an kadar gerçek</em> olabilir. Einstein'ın
            denklemleri bunu ima ediyor. Bu sayfada o 4 boyutlu bloğu kendi elinle
            dilimleyeceksin.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#blok"
              className="rounded-full bg-cyan-glow px-6 py-3 text-[0.92rem] font-semibold text-void transition-transform active:scale-[0.97]"
            >
              Bloğa gir
            </a>
            <a
              href="#esanlilik"
              className="rounded-full border border-line px-6 py-3 text-[0.92rem] font-medium text-chalk/90 transition-colors hover:border-cyan-glow/50"
            >
              Doğrudan simülasyona
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.72rem] text-mist">
            <li>9 bölüm</li>
            <li aria-hidden="true">·</li>
            <li>6 etkileşimli simülasyon</li>
            <li aria-hidden="true">·</li>
            <li>gerçek Lorentz matematiği</li>
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center md:flex"
      >
        <span className="font-mono text-[0.68rem] tracking-[0.3em] text-mist/70 uppercase">
          aşağı kaydır
        </span>
      </motion.div>
    </section>
  )
}
