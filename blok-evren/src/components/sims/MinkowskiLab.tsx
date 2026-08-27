import { useCallback, useMemo, useRef, useState } from 'react'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { PAL, hexAlpha } from '../../lib/palette'
import {
  boost,
  causalRelation,
  clampBeta,
  formatTR,
  gamma,
  type Event2D,
} from '../../lib/relativity'
import { Legend, Panel, PillButton, SegmentedControl, Slider, Stat, TouchHint } from '../ui'

/**
 * Minkowski laboratuvarı.
 *
 * Aynı olay kümesini iki şekilde gösterir:
 *  • "durgun" — laboratuvar çerçevesi sabit, hareketli gözlemcinin eksenleri eğik
 *  • "hareketli" — her şey Lorentz dönüşümünden geçirilmiş, eksenler dik
 *
 * Alttaki sıralama şeridi asıl dersi verir: uzaysal ayrılmış olayların sırası
 * gözlemciye göre değişir, zamansal ayrılmışların sırası ise asla değişmez.
 */

const RANGE = 4.6 // tuvalin gösterdiği yarı-genişlik (ışık-saniyesi / saniye)

interface LabEvent extends Event2D {
  id: string
  name: string
  short: string
  color: string
}

const DEFAULT_EVENTS: LabEvent[] = [
  { id: 'a', name: 'Yıldız patlar', short: 'A', t: 1.2, x: -2.6, color: PAL.rose },
  { id: 'b', name: 'Alarm çalar', short: 'B', t: 1.6, x: 2.4, color: PAL.amber },
  { id: 'c', name: 'Kalkış', short: 'C', t: -1.9, x: 0.6, color: PAL.violet },
  { id: 'd', name: 'İniş', short: 'D', t: 2.4, x: 1.2, color: PAL.lime },
]

type FrameMode = 'rest' | 'moving'

export function MinkowskiLab() {
  const [beta, setBeta] = useState(0)
  const [mode, setMode] = useState<FrameMode>('rest')
  const [events, setEvents] = useState<LabEvent[]>(DEFAULT_EVENTS)
  const [dragMode, setDragMode] = useState(false)
  const [showHyperbolae, setShowHyperbolae] = useState(false)

  const dragging = useRef<string | null>(null)
  const geom = useRef({ cx: 0, cy: 0, scale: 1 })

  /** Seçili çerçevedeki koordinatlar. */
  const viewEvents = useMemo(
    () =>
      events.map((e) =>
        mode === 'moving' ? { ...e, ...boost({ t: e.t, x: e.x }, beta) } : e,
      ),
    [events, beta, mode],
  )

  /** Zamana göre sıralama — çerçeve değişince sıra da değişebilir. */
  const ordering = useMemo(
    () => [...viewEvents].sort((p, q) => p.t - q.t),
    [viewEvents],
  )

  /** A ve B uzaysal ayrılmışsa sıraları βc = Δt/Δx üzerinde tersine döner. */
  const swapInfo = useMemo(() => {
    const a = events.find((e) => e.id === 'a')!
    const b = events.find((e) => e.id === 'b')!
    const rel = causalRelation(a, b)
    const dt = b.t - a.t
    const dx = b.x - a.x
    const critical = dx !== 0 ? dt / dx : Infinity
    return { rel, critical, dt, dx }
  }, [events])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const pad = 14
      const size = Math.min(w, h) - pad * 2
      const scale = size / (RANGE * 2)
      const cx = w / 2
      const cy = h / 2
      geom.current = { cx, cy, scale }

      const sx = (x: number) => cx + x * scale
      const sy = (t: number) => cy - t * scale

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, w, h)
      ctx.clip()

      // --- Izgara ---
      ctx.lineWidth = 1
      ctx.strokeStyle = PAL.grid
      for (let i = -Math.ceil(RANGE); i <= Math.ceil(RANGE); i += 1) {
        ctx.globalAlpha = i === 0 ? 0 : 0.55
        ctx.beginPath()
        ctx.moveTo(sx(i), 0)
        ctx.lineTo(sx(i), h)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, sy(i))
        ctx.lineTo(w, sy(i))
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // --- Işık konisi (her çerçevede 45°) ---
      const lightSpan = RANGE * 1.6
      ctx.strokeStyle = hexAlpha(PAL.amber, 0.55)
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 5])
      ;[1, -1].forEach((s) => {
        ctx.beginPath()
        ctx.moveTo(sx(-lightSpan * s), sy(-lightSpan))
        ctx.lineTo(sx(lightSpan * s), sy(lightSpan))
        ctx.stroke()
      })
      ctx.setLineDash([])

      // Işık konisinin içini hafifçe boya (gelecek + geçmiş)
      ctx.fillStyle = hexAlpha(PAL.cyan, 0.05)
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(-lightSpan), sy(lightSpan))
      ctx.lineTo(sx(lightSpan), sy(lightSpan))
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = hexAlpha(PAL.violet, 0.05)
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(-lightSpan), sy(-lightSpan))
      ctx.lineTo(sx(lightSpan), sy(-lightSpan))
      ctx.closePath()
      ctx.fill()

      // --- Değişmez hiperboller: x² − t² = ±k ---
      if (showHyperbolae) {
        ctx.strokeStyle = hexAlpha(PAL.mist, 0.35)
        ctx.lineWidth = 1
        ctx.setLineDash([3, 4])
        for (const k of [1, 4]) {
          // Zamansal kollar (üst / alt)
          ;[1, -1].forEach((sgn) => {
            ctx.beginPath()
            for (let x = -RANGE * 1.4; x <= RANGE * 1.4; x += 0.06) {
              const t = sgn * Math.sqrt(x * x + k)
              if (x === -RANGE * 1.4) ctx.moveTo(sx(x), sy(t))
              else ctx.lineTo(sx(x), sy(t))
            }
            ctx.stroke()
          })
          // Uzaysal kollar (sağ / sol)
          ;[1, -1].forEach((sgn) => {
            ctx.beginPath()
            for (let t = -RANGE * 1.4; t <= RANGE * 1.4; t += 0.06) {
              const x = sgn * Math.sqrt(t * t + k)
              if (t === -RANGE * 1.4) ctx.moveTo(sx(x), sy(t))
              else ctx.lineTo(sx(x), sy(t))
            }
            ctx.stroke()
          })
        }
        ctx.setLineDash([])
      }

      // --- Diğer gözlemcinin eksenleri ---
      const b = clampBeta(beta)
      // "rest" modunda hareketli gözlemcinin eksenleri eğik;
      // "moving" modunda tersine, laboratuvarın eksenleri eğik görünür.
      const tilt = mode === 'rest' ? b : -b
      const other = mode === 'rest' ? PAL.cyan : PAL.mist

      if (Math.abs(tilt) > 0.001) {
        const span = RANGE * 1.5
        // Zaman ekseni t′: x = βt
        ctx.strokeStyle = hexAlpha(other, 0.85)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(sx(-tilt * span), sy(-span))
        ctx.lineTo(sx(tilt * span), sy(span))
        ctx.stroke()
        // Uzay ekseni x′: t = βx
        ctx.beginPath()
        ctx.moveTo(sx(-span), sy(-tilt * span))
        ctx.lineTo(sx(span), sy(tilt * span))
        ctx.stroke()

        // Eşzamanlılık doğruları ailesi: t = βx + c
        ctx.strokeStyle = hexAlpha(other, 0.25)
        ctx.lineWidth = 1
        ctx.setLineDash([4, 6])
        for (let c = -4; c <= 4; c += 1) {
          if (c === 0) continue
          ctx.beginPath()
          ctx.moveTo(sx(-span), sy(-tilt * span + c))
          ctx.lineTo(sx(span), sy(tilt * span + c))
          ctx.stroke()
        }
        ctx.setLineDash([])
      }

      // --- Ana eksenler ---
      ctx.strokeStyle = hexAlpha(PAL.chalk, 0.55)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(sx(0), 0)
      ctx.lineTo(sx(0), h)
      ctx.moveTo(0, sy(0))
      ctx.lineTo(w, sy(0))
      ctx.stroke()

      ctx.fillStyle = hexAlpha(PAL.mist, 0.9)
      ctx.font = '500 11px JetBrains Mono, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(mode === 'rest' ? 'ct' : "ct′", sx(0) + 7, 16)
      ctx.textAlign = 'right'
      ctx.fillText(mode === 'rest' ? 'x' : 'x′', w - 6, sy(0) - 7)

      // --- Olaylar ---
      const view =
        mode === 'moving'
          ? events.map((e) => ({ ...e, ...boost({ t: e.t, x: e.x }, beta) }))
          : events

      view.forEach((e) => {
        const px = sx(e.x)
        const py = sy(e.t)

        // Eşzamanlılık göstergesi: olaydan zaman eksenine yatay bağ
        ctx.strokeStyle = hexAlpha(e.color, 0.3)
        ctx.lineWidth = 1
        ctx.setLineDash([2, 4])
        ctx.beginPath()
        ctx.moveTo(sx(0), py)
        ctx.lineTo(px, py)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = e.color
        ctx.shadowColor = e.color
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.arc(px, py, 6.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.fillStyle = PAL.void
        ctx.font = '700 9px JetBrains Mono, monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(e.short, px, py + 0.5)

        ctx.fillStyle = e.color
        ctx.font = '500 10.5px Inter, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(e.name, px + 11, py - 8)
      })

      ctx.restore()
    },
    [events, beta, mode, showHyperbolae],
  )

  const canvasRef = useCanvas2D(draw)

  /* ---------------- Dokunmatik sürükleme ---------------- */

  const toWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const { cx, cy, scale } = geom.current
    return {
      x: (clientX - rect.left - cx) / scale,
      t: -(clientY - rect.top - cy) / scale,
    }
  }

  const onPointerDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragMode) return
    const p = toWorld(ev.clientX, ev.clientY)
    if (!p) return
    // En yakın olayı yakala (ekran biriminde ~22 px eşik)
    const threshold = 22 / geom.current.scale
    let best: { id: string; d: number } | null = null
    for (const e of events) {
      const shown = mode === 'moving' ? boost({ t: e.t, x: e.x }, beta) : { t: e.t, x: e.x }
      const d = Math.hypot(shown.x - p.x, shown.t - p.t)
      if (d < threshold && (!best || d < best.d)) best = { id: e.id, d }
    }
    if (best) {
      dragging.current = best.id
      ev.currentTarget.setPointerCapture(ev.pointerId)
    }
  }

  const onPointerMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return
    const p = toWorld(ev.clientX, ev.clientY)
    if (!p) return
    const id = dragging.current
    // Ekranda görülen konumu istiyoruz; hareketli çerçevedeysek
    // laboratuvar koordinatlarına geri çeviriyoruz.
    const lab = mode === 'moving' ? boost(p, -beta) : p
    const clamp = (v: number) => Math.max(-RANGE, Math.min(RANGE, v))
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, t: clamp(lab.t), x: clamp(lab.x) } : e)),
    )
  }

  const onPointerUp = () => {
    dragging.current = null
  }

  /* ---------------- Arayüz ---------------- */

  const g = gamma(beta)

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="min-w-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-void-2">
          <canvas
            className="absolute inset-0"
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ touchAction: dragMode ? 'none' : 'pan-y' }}
          />
          <div className="pointer-events-none absolute top-3 left-3 rounded-full border border-line bg-void/80 px-3 py-1 font-mono text-[0.68rem] text-mist">
            {mode === 'rest' ? 'laboratuvar çerçevesi' : `β = ${formatTR(beta, 2)} çerçevesi`}
          </div>
        </div>
        <TouchHint>
          {dragMode
            ? 'Olayları parmağınla sürükle. Sayfayı kaydırmak için taşıma modunu kapat.'
            : 'Işık ışınları her çerçevede tam 45°. Kaydırıcıyı çevir, eksenlerin makasa dönüşünü izle.'}
        </TouchHint>
      </div>

      <div className="flex flex-col gap-4">
        <Panel title="Gözlemci" hint={`γ = ${formatTR(g, 3)}`}>
          <Slider
            label="Bağıl hız β = v/c"
            value={beta}
            display={formatTR(beta, 2)}
            min={-0.92}
            max={0.92}
            step={0.01}
            onChange={setBeta}
          />
          <div className="mt-3">
            <SegmentedControl
              label="Hangi çerçeveden bakıyoruz?"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'rest', label: 'Durgun' },
                { value: 'moving', label: 'Hareketli' },
              ]}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <PillButton active={dragMode} onClick={() => setDragMode((v) => !v)}>
              {dragMode ? '✓ Olayları taşı' : 'Olayları taşı'}
            </PillButton>
            <PillButton active={showHyperbolae} onClick={() => setShowHyperbolae((v) => !v)}>
              Değişmez hiperboller
            </PillButton>
            <PillButton
              onClick={() => {
                setEvents(DEFAULT_EVENTS)
                setBeta(0)
              }}
            >
              Sıfırla
            </PillButton>
          </div>
        </Panel>

        <Panel title="Olayların zaman sırası" hint="bu çerçeveye göre">
          <ol className="flex flex-wrap items-center gap-1.5">
            {ordering.map((e, i) => (
              <li key={e.id} className="flex items-center gap-1.5">
                <span
                  className="rounded-lg border px-2.5 py-1 font-mono text-[0.75rem]"
                  style={{
                    color: e.color,
                    borderColor: hexAlpha(e.color, 0.45),
                    background: hexAlpha(e.color, 0.1),
                  }}
                >
                  {e.short} · {formatTR(e.t, 2)}
                </span>
                {i < ordering.length - 1 && <span className="text-mist/50">→</span>}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-mist">
            {swapInfo.rel === 'elsewhere' ? (
              <>
                <span className="text-chalk">A</span> ve <span className="text-chalk">B</span>{' '}
                uzaysal ayrılmış: β ={' '}
                <span className="font-mono text-amber-glow">
                  {formatTR(swapInfo.critical, 2)}
                </span>{' '}
                değerini geçtiğinde sıraları tersine döner. Hiçbir sinyal aralarında
                gidemediği için bu çelişki değil.
              </>
            ) : (
              <>
                <span className="text-chalk">A</span> ve <span className="text-chalk">B</span> artık
                zamansal ayrılmış: aralarında nedensel bağ kurulabilir, bu yüzden{' '}
                <span className="text-lime-glow">hiçbir gözlemci sıralarını ters göremez</span>.
              </>
            )}
          </p>
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Lorentz çarpanı" value={formatTR(g, 3)} tone="cyan" />
          <Stat
            label="Zaman genişlemesi"
            value={`${formatTR((1 - 1 / g) * 100, 1)}%`}
            unit="yavaşlama"
            tone="violet"
          />
        </div>

        <Legend
          items={[
            { color: PAL.amber, label: 'ışık konisi (45°)', dashed: true },
            { color: PAL.cyan, label: 'diğer gözlemcinin eksenleri' },
            { color: PAL.mist, label: 'eşzamanlılık doğruları', dashed: true },
          ]}
        />
      </div>
    </div>
  )
}
