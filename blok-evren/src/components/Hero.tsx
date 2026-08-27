import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'motion/react'
import { BlockUniverseScene } from './three/BlockUniverseScene'

/**
 * Açılış.
 *
 * Arka planda bir günün bloğu yavaşça dönüyor ve "şimdi" dilimi içinden
 * geçiyor — sayfanın bütün iddiası tek görüntüde. Tuvalde OrbitControls yok,
 * böylece telefonda ilk dokunuş hâlâ sayfayı kaydırır.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 md:justify-center md:pb-0">
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [9, 5.5, 11], fov: 44 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <BlockUniverseScene
              beta={0.38}
              sweepSpeed={0.8}
              showLabels={false}
              enableControls={false}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Okunabilirlik perdesi: metnin arkası her temada sağlam kalsın */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/30 md:bg-gradient-to-r md:from-bg md:via-bg/90 md:to-transparent" />

      <div className="shell relative">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="eyebrow mb-5">Zaman üzerine bir deneme</p>
          <h1 className="text-[2.7rem] leading-[1.03] sm:text-[3.6rem] md:text-[4.4rem]">
            Dün hâlâ
            <br />
            <span className="text-mint">bir yerde mi?</span>
          </h1>
          <p className="lede measure mt-6">
            Bu sabah uyandığın an şu anda nerede? Ya yarın akşam yiyeceğin yemek? Sezgimiz net bir
            cevap veriyor: biri gitti, öteki daha gelmedi. Ama Einstein’ın denklemleri buna pek
            katılmıyor.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#blok"
              className="rounded-full bg-mint px-6 py-3 text-[0.95rem] font-medium text-bg transition-transform active:scale-[0.97]"
            >
              Başla
            </a>
            <a
              href="#simdi"
              className="rounded-full border border-line-strong bg-surface px-6 py-3 text-[0.95rem] font-medium text-ink transition-colors hover:border-mint"
            >
              Doğrudan simülasyona
            </a>
          </div>

          <p className="mt-8 font-mono text-[0.76rem] text-muted">
            9 bölüm · 6 simülasyon · hepsi elle oynanır
          </p>
        </motion.div>
      </div>
    </section>
  )
}
