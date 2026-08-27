import { useEffect, useRef, useState } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { BLOCK, BlockUniverseScene } from '../three/BlockUniverseScene'
import { Callout, Legend, Panel, PillButton, Slider, Stat, TouchHint } from '../ui'
import { PAL } from '../../lib/palette'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { formatTR, gamma } from '../../lib/relativity'

/**
 * Blok evren gezgini: 3B sahne + dokunmatik denetimler.
 *
 * β kaydırıcısı "şimdi" düzleminin eğimini, zaman kaydırıcısı ise düzlemin
 * blok içindeki yüksekliğini değiştirir. Süpürme düğmesi zamanın akıyormuş
 * gibi görünmesini sağlar — ama blok boyunca hareket eden tek şey dilimdir.
 */
export function BlockExplorer() {
  const [beta, setBeta] = useState(0.32)
  const [sliceT, setSliceT] = useState(0)
  const [sweeping, setSweeping] = useState(false)
  const [showWorldlines, setShowWorldlines] = useState(true)
  const [showEvents, setShowEvents] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  const narrow = useIsNarrow()

  const sliceRef = useRef(sliceT)
  sliceRef.current = sliceT

  // Süpürme: saniyede ~30 güncelleme yeter, sahne yumuşak görünür.
  useEffect(() => {
    if (!sweeping) return
    let raf = 0
    let last = performance.now()
    let acc = 0

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      acc += dt
      if (acc >= 1 / 30) {
        acc = 0
        let next = sliceRef.current + dt * 1.6
        if (next > BLOCK.y) next = -BLOCK.y
        sliceRef.current = next
        setSliceT(next)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [sweeping])

  const tiltDegrees = (Math.atan(beta) * 180) / Math.PI

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div className="min-w-0">
        <SceneFrame
          label="Uzayzaman bloğu: dikey eksen zaman, yatay eksenler uzay. Eğik sarı düzlem gözlemcinin şimdisi."
          camera={narrow ? [10.5, 6.5, 13] : [8, 5, 10]}
          overlay={
            <div className="pointer-events-none absolute top-3 left-3 rounded-full border border-line bg-void/80 px-3 py-1 font-mono text-[0.68rem] text-mist">
              β = {formatTR(beta, 2)} · eğim {formatTR(tiltDegrees, 1)}°
            </div>
          }
        >
          <BlockUniverseScene
            beta={beta}
            sliceT={sliceT}
            showWorldlines={showWorldlines}
            showEvents={showEvents}
            showLabels={showWorldlines}
            autoRotate={autoRotate}
          />
        </SceneFrame>
        <TouchHint>Bloğu parmağınla çevir, iki parmakla yakınlaş.</TouchHint>
      </div>

      <div className="flex flex-col gap-4">
        <Panel title="Gözlemciyi seç" hint={`γ = ${formatTR(gamma(beta), 3)}`}>
          <Slider
            label="Hız β = v/c — şimdi düzleminin eğimi"
            value={beta}
            display={formatTR(beta, 2)}
            min={-0.85}
            max={0.85}
            step={0.01}
            onChange={setBeta}
          />
          <div className="mt-3">
            <Slider
              label="Şimdi düzleminin zamanı"
              value={sliceT}
              display={formatTR(sliceT, 2)}
              min={-BLOCK.y}
              max={BLOCK.y}
              step={0.02}
              onChange={(v) => {
                setSweeping(false)
                setSliceT(v)
              }}
              accent="amber"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <PillButton active={sweeping} onClick={() => setSweeping((v) => !v)}>
              {sweeping ? '❚❚ Süpürmeyi durdur' : '▶ Zamanı süpür'}
            </PillButton>
            <PillButton active={showWorldlines} onClick={() => setShowWorldlines((v) => !v)}>
              Dünya çizgileri
            </PillButton>
            <PillButton active={showEvents} onClick={() => setShowEvents((v) => !v)}>
              Olay bulutu
            </PillButton>
            <PillButton active={autoRotate} onClick={() => setAutoRotate((v) => !v)}>
              Kendi dönsün
            </PillButton>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Düzlem eğimi" value={`${formatTR(tiltDegrees, 1)}°`} tone="amber" />
          <Stat label="Lorentz çarpanı" value={formatTR(gamma(beta), 3)} tone="cyan" />
        </div>

        <Callout kind="insight" title="Dikkat: blok kıpırdamıyor">
          Süpürme düğmesine bastığında hareket eden şey blok değil, dilim. β'yı
          değiştirdiğinde ise dilimin <em>açısı</em> döner — ve aynı anda "şimdi" saydığın
          olaylar kümesi bütünüyle başkalaşır. Blok evren fikri tam olarak budur: farklı
          gözlemciler aynı 4 boyutlu gerçekliği farklı açılarla keser.
        </Callout>

        <Legend
          items={[
            { color: PAL.cyan, label: 'sen' },
            { color: PAL.violet, label: 'ay' },
            { color: PAL.lime, label: 'gemi (β = 0,45)' },
            { color: PAL.amber, label: 'foton — hep 45°', dashed: true },
          ]}
        />
      </div>
    </div>
  )
}
