import { useEffect, useMemo, useRef, useState } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { BlockUniverseScene } from '../three/BlockUniverseScene'
import { Callout, Panel, PillButton, Slider, TouchHint } from '../ui'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { useThemePalette } from '../../lib/theme'
import {
  BLOCK,
  WORLDLINES,
  blockTimeToClock,
  clockGap,
  findSliceIntersection,
} from '../../lib/worldlines'
import { formatTR } from '../../lib/relativity'

/**
 * Blok gezgini.
 *
 * Asıl mesele sağdaki listede: düzlem düz dururken herkesin saati aynıdır.
 * Eğdiğin anda saatler ayrışır — ve ayrışan şey saatler değil, senin "aynı
 * anda oluyor" dediğin şeyler kümesidir.
 */

const OBSERVERS = [
  { label: 'Duran biri', beta: 0 },
  { label: 'Yürüyen biri', beta: 0.18 },
  { label: 'Geçen tren', beta: 0.5 },
  { label: 'Neredeyse ışık', beta: 0.85 },
]

export function BlockExplorer() {
  const [beta, setBeta] = useState(0)
  const [sliceT, setSliceT] = useState(0)
  const [sweeping, setSweeping] = useState(false)
  const [showEvents, setShowEvents] = useState(true)
  const pal = useThemePalette()
  const narrow = useIsNarrow()

  const sliceRef = useRef(sliceT)
  sliceRef.current = sliceT

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
        let next = sliceRef.current + dt * 1.5
        if (next > BLOCK.y) next = -BLOCK.y
        sliceRef.current = next
        setSliceT(next)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [sweeping])

  /** Her dünya çizgisinin bu "şimdi" düzlemindeki saati. */
  const readings = useMemo(() => {
    const hits = WORLDLINES.map((def) => {
      const point = findSliceIntersection(def, beta, sliceT)
      return { def, t: point ? point[1] : null }
    })
    const you = hits.find((h) => h.def.id === 'you')?.t ?? null
    return hits.map((h) => ({
      ...h,
      clock: h.t === null ? null : blockTimeToClock(h.t),
      gap: h.t === null || you === null || h.def.id === 'you' ? null : clockGap(h.t, you),
      ahead: h.t !== null && you !== null ? h.t > you : false,
    }))
  }, [beta, sliceT])

  const spread = useMemo(() => {
    const ts = readings.map((r) => r.t).filter((t): t is number => t !== null)
    if (ts.length < 2) return null
    return clockGap(Math.max(...ts), Math.min(...ts))
  }, [readings])

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="min-w-0">
        <SceneFrame
          label="Bir günün uzayzaman bloğu: dikey eksen o günün saatleri, yatay eksenler mekân. Yeşil düzlem bir gözlemcinin şimdisi."
          camera={narrow ? [10.5, 6.5, 13] : [8, 5, 10]}
          overlay={
            <div
              className="pointer-events-none absolute top-3 left-3 rounded-full border px-3 py-1 font-mono text-[0.7rem]"
              style={{ background: pal.surface, borderColor: pal.border, color: pal.muted }}
            >
              β = {formatTR(beta, 2)} · dilim {blockTimeToClock(sliceT)}
            </div>
          }
        >
          <BlockUniverseScene
            beta={beta}
            sliceT={sliceT}
            showEvents={showEvents}
            autoRotate={!sweeping}
          />
        </SceneFrame>
        <TouchHint>
          Dikey eksen sabah 06:00’dan gece 22:00’ye uzanıyor. Bloğu parmağınla çevir, iki
          parmakla yakınlaş.
        </TouchHint>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Kimin şimdisinden bakıyorsun?">
          <div className="mb-3 flex flex-wrap gap-2">
            {OBSERVERS.map((o) => (
              <PillButton key={o.label} active={Math.abs(beta - o.beta) < 0.005} onClick={() => setBeta(o.beta)}>
                {o.label}
              </PillButton>
            ))}
          </div>
          <Slider
            label="Hızı kendin ayarla"
            hint="Düzlemin eğimi bu hızla belirlenir."
            value={beta}
            display={`β = ${formatTR(beta, 2)}`}
            min={-0.85}
            max={0.85}
            step={0.01}
            onChange={setBeta}
          />
          <div className="mt-2">
            <Slider
              label="Günün hangi saati?"
              value={sliceT}
              display={blockTimeToClock(sliceT)}
              min={-BLOCK.y}
              max={BLOCK.y}
              step={0.02}
              onChange={(v) => {
                setSweeping(false)
                setSliceT(v)
              }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <PillButton active={sweeping} onClick={() => setSweeping((v) => !v)}>
              {sweeping ? 'Günü durdur' : 'Günü akıt'}
            </PillButton>
            <PillButton active={showEvents} onClick={() => setShowEvents((v) => !v)}>
              Olay bulutu
            </PillButton>
            <PillButton
              onClick={() => {
                setBeta(0)
                setSliceT(0)
                setSweeping(false)
              }}
            >
              Başa dön
            </PillButton>
          </div>
        </Panel>

        <Panel
          title="Bu düzlemde şu an"
          hint={spread ? `en uçtakiler arası: ${spread}` : undefined}
        >
          <ul className="space-y-1.5">
            {readings.map((r) => (
              <li
                key={r.def.id}
                className="card-inset flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: pal[r.def.tone] }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9rem] font-medium text-ink">
                      {r.def.name}
                    </span>
                    <span className="block truncate text-[0.75rem] text-muted">{r.def.note}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="tnum block font-mono text-[0.95rem] font-medium text-ink">
                    {r.clock ?? '—'}
                  </span>
                  {r.gap && (
                    <span className="block font-mono text-[0.7rem] text-muted">
                      {r.ahead ? '+' : '−'}
                      {r.gap}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Callout
          kind={Math.abs(beta) < 0.005 ? 'insight' : 'objection'}
          title={
            Math.abs(beta) < 0.005
              ? 'Düzlem düzken herkesin saati aynı'
              : 'Düzlemi eğdin — ve “aynı an” dağıldı'
          }
        >
          {Math.abs(beta) < 0.005 ? (
            <>
              Sezgimizin beklediği şey bu: bir “şu an” var, herkes onun içinde. Şimdi hızı
              biraz artır ve listeye bak.
            </>
          ) : (
            <>
              Aynı bloğa bakıyorsun, hiçbir şey kıpırdamadı. Ama artık senin “şu anda oluyor”
              dediğin şeyler kümesi başka. Annen senin şimdinde{' '}
              <span className="accent">{readings.find((r) => r.def.id === 'mother')?.clock}</span>{' '}
              yaşıyor, trendeki yolcu{' '}
              <span className="accent">{readings.find((r) => r.def.id === 'train')?.clock}</span>.
              Hangisi “gerçekten” şimdi?
            </>
          )}
        </Callout>
      </div>
    </div>
  )
}
