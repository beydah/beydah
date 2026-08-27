import { useCallback, useMemo, useRef, useState } from 'react'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { alpha, useThemePalette, type Palette } from '../../lib/theme'
import { boost, causalRelation, clampBeta, formatTR, type Event2D } from '../../lib/relativity'
import { Legend, Panel, PillButton, SegmentedControl, Slider, TouchHint } from '../ui'

/**
 * Şimdi laboratuvarı.
 *
 * Dört sıradan olay: bir alarm, bir kahve, gönderilen ve okunan bir mesaj.
 * Hızını değiştirdikçe bu olayların sırası değişir — ama hepsinin değil.
 * Aralarında bir sinyalin gidebildiği olaylar (mesaj gönderildi → okundu)
 * hiçbir gözlemci için ters dönmez. Nedensellik korunur; “aynı anda” korunmaz.
 */

const RANGE = 4.6

interface LabEvent extends Event2D {
  id: string
  /** Panellerde geçen tam ad. */
  name: string
  /** Tuvale sığan kısa ad — uzun adlar küçük ekranda birbirini eziyordu. */
  tag: string
  /** Nokta içindeki harf. */
  short: string
  tone: keyof Palette
}

const SCENARIOS: Record<string, { label: string; events: LabEvent[] }> = {
  uzak: {
    label: 'İki uzak şehir',
    events: [
      { id: 'a', name: 'Alarmın çaldı', tag: 'Alarm', short: 'A', t: 1.2, x: -2.6, tone: 'd1' },
      { id: 'b', name: 'Tokyo’da biri uyandı', tag: 'Tokyo uyandı', short: 'B', t: 1.6, x: 2.4, tone: 'd2' },
      { id: 'c', name: 'Mesajı gönderdin', tag: 'Mesaj gitti', short: 'C', t: -1.9, x: 0.6, tone: 'd3' },
      { id: 'd', name: 'Mesajı okudu', tag: 'Mesaj okundu', short: 'D', t: 2.4, x: 1.2, tone: 'd4' },
    ],
  },
  ayniOda: {
    label: 'Aynı odada',
    events: [
      { id: 'a', name: 'Işığı açtın', tag: 'Işık', short: 'A', t: -1.4, x: -0.3, tone: 'd1' },
      { id: 'b', name: 'Kedi uyandı', tag: 'Kedi', short: 'B', t: -0.6, x: 0.4, tone: 'd2' },
      { id: 'c', name: 'Su ısındı', tag: 'Su', short: 'C', t: 1.1, x: -0.5, tone: 'd3' },
      { id: 'd', name: 'Çay demlendi', tag: 'Çay', short: 'D', t: 2.6, x: 0.2, tone: 'd4' },
    ],
  },
  cekisme: {
    label: 'Sınırdaki olaylar',
    events: [
      { id: 'a', name: 'Kapı çaldı', tag: 'Kapı', short: 'A', t: 0, x: -2.2, tone: 'd1' },
      { id: 'b', name: 'Telefon çaldı', tag: 'Telefon', short: 'B', t: 0, x: 2.2, tone: 'd2' },
      { id: 'c', name: 'Kalktın', tag: 'Kalktın', short: 'C', t: -2.4, x: 0, tone: 'd3' },
      { id: 'd', name: 'Kapıyı açtın', tag: 'Kapıyı açtın', short: 'D', t: 2.8, x: -1.6, tone: 'd4' },
    ],
  },
}

type FrameMode = 'rest' | 'moving'

export function MinkowskiLab() {
  const pal = useThemePalette()
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>('uzak')
  const [beta, setBeta] = useState(0)
  const [mode, setMode] = useState<FrameMode>('rest')
  const [events, setEvents] = useState<LabEvent[]>(SCENARIOS.uzak.events)
  const [dragMode, setDragMode] = useState(false)
  const [pair, setPair] = useState<[string, string]>(['a', 'b'])

  const dragging = useRef<string | null>(null)
  const geom = useRef({ cx: 0, cy: 0, scale: 1 })

  const loadScenario = (key: keyof typeof SCENARIOS) => {
    setScenario(key)
    setEvents(SCENARIOS[key].events)
    setPair(['a', 'b'])
    setBeta(0)
  }

  const shown = useMemo(
    () =>
      events.map((e) =>
        mode === 'moving' ? { ...e, ...boost({ t: e.t, x: e.x }, beta) } : e,
      ),
    [events, beta, mode],
  )

  const ordering = useMemo(() => [...shown].sort((p, q) => p.t - q.t), [shown])

  /** Seçili çiftin nedensel ilişkisi ve sırasının dönüp dönmediği. */
  const verdict = useMemo(() => {
    const a = events.find((e) => e.id === pair[0])
    const b = events.find((e) => e.id === pair[1])
    if (!a || !b) return null

    const rel = causalRelation(a, b)
    const dx = b.x - a.x
    const dt = b.t - a.t
    const critical = Math.abs(dx) > 1e-6 ? dt / dx : Infinity

    const sa = shown.find((e) => e.id === pair[0])!
    const sb = shown.find((e) => e.id === pair[1])!
    const restFirst = a.t <= b.t ? a : b
    const nowFirst = sa.t <= sb.t ? a : b
    const flipped = restFirst.id !== nowFirst.id

    return { a, b, rel, critical, flipped, nowFirst, gap: Math.abs(sb.t - sa.t) }
  }, [events, pair, shown])

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
      ctx.strokeStyle = pal.grid
      ctx.lineWidth = 1
      for (let i = -Math.ceil(RANGE); i <= Math.ceil(RANGE); i += 1) {
        if (i === 0) continue
        ctx.beginPath()
        ctx.moveTo(sx(i), 0)
        ctx.lineTo(sx(i), h)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, sy(i))
        ctx.lineTo(w, sy(i))
        ctx.stroke()
      }

      // --- Işık konisi ve içi ---
      const span = RANGE * 1.6
      ctx.fillStyle = alpha(pal.mintBright, 0.07)
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(-span), sy(span))
      ctx.lineTo(sx(span), sy(span))
      ctx.closePath()
      ctx.fill()
      // Geçmiş konisi ayrı bir renkte: "olabilecekler" ile "olmuş olabilecekler"
      // aynı tonda olursa diyagram tek bir yeşil lekeye dönüşüyor.
      ctx.fillStyle = alpha(pal.d3, 0.07)
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(-span), sy(-span))
      ctx.lineTo(sx(span), sy(-span))
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = alpha(pal.d5, 0.85)
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 5])
      ;[1, -1].forEach((s) => {
        ctx.beginPath()
        ctx.moveTo(sx(-span * s), sy(-span))
        ctx.lineTo(sx(span * s), sy(span))
        ctx.stroke()
      })
      ctx.setLineDash([])

      // --- Diğer gözlemcinin eksenleri ve eşzamanlılık doğruları ---
      const b = clampBeta(beta)
      const tilt = mode === 'rest' ? b : -b

      if (Math.abs(tilt) > 0.001) {
        const s = RANGE * 1.5
        ctx.strokeStyle = alpha(pal.mint, 0.9)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(sx(-tilt * s), sy(-s))
        ctx.lineTo(sx(tilt * s), sy(s))
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(sx(-s), sy(-tilt * s))
        ctx.lineTo(sx(s), sy(tilt * s))
        ctx.stroke()

        ctx.strokeStyle = alpha(pal.mint, 0.3)
        ctx.lineWidth = 1
        ctx.setLineDash([4, 6])
        for (let c = -4; c <= 4; c += 1) {
          if (c === 0) continue
          ctx.beginPath()
          ctx.moveTo(sx(-s), sy(-tilt * s + c))
          ctx.lineTo(sx(s), sy(tilt * s + c))
          ctx.stroke()
        }
        ctx.setLineDash([])
      }

      // --- Ana eksenler ---
      ctx.strokeStyle = alpha(pal.text, 0.5)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(sx(0), 0)
      ctx.lineTo(sx(0), h)
      ctx.moveTo(0, sy(0))
      ctx.lineTo(w, sy(0))
      ctx.stroke()

      ctx.fillStyle = pal.muted
      ctx.font = "500 11px 'JetBrains Mono', monospace"
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('sonra ↑', sx(0) + 8, 8)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('uzaklık →', w - 8, sy(0) - 8)

      // --- Seçili çift arasındaki bağ ---
      if (verdict) {
        const pa = shown.find((e) => e.id === verdict.a.id)!
        const pb = shown.find((e) => e.id === verdict.b.id)!
        ctx.strokeStyle = verdict.rel === 'elsewhere' ? alpha(pal.clay, 0.75) : alpha(pal.mint, 0.75)
        ctx.lineWidth = 2
        ctx.setLineDash(verdict.rel === 'elsewhere' ? [5, 5] : [])
        ctx.beginPath()
        ctx.moveTo(sx(pa.x), sy(pa.t))
        ctx.lineTo(sx(pb.x), sy(pb.t))
        ctx.stroke()
        ctx.setLineDash([])
      }

      // --- Olaylar ---
      shown.forEach((e, i) => {
        const px = sx(e.x)
        const py = sy(e.t)
        const color = pal[e.tone]
        const selected = e.id === pair[0] || e.id === pair[1]

        // Bu olayın zaman damgasına giden yatay kılavuz
        ctx.strokeStyle = alpha(color, 0.4)
        ctx.lineWidth = 1
        ctx.setLineDash([2, 4])
        ctx.beginPath()
        ctx.moveTo(sx(0), py)
        ctx.lineTo(px, py)
        ctx.stroke()
        ctx.setLineDash([])

        if (selected) {
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(px, py, 12, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(px, py, 7.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = pal.bg
        ctx.font = "700 10px 'JetBrains Mono', monospace"
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(e.short, px, py + 0.5)

        // Etiketi tuval içinde tut ve sırayla üst/alt yerleştir —
        // yakın yükseklikteki olayların adları birbirini ezmesin.
        ctx.font = "500 11px 'Instrument Sans', sans-serif"
        const tw = ctx.measureText(e.tag).width
        const left = px + 13 + tw > w - 6
        const below = i % 2 === 1
        ctx.textAlign = left ? 'right' : 'left'
        ctx.textBaseline = below ? 'top' : 'alphabetic'
        ctx.fillStyle = pal.text
        ctx.fillText(e.tag, left ? px - 13 : px + 13, below ? py + 10 : py - 10)
      })

      ctx.restore()
    },
    [shown, beta, mode, pal, pair, verdict],
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
    const p = toWorld(ev.clientX, ev.clientY)
    if (!p) return
    const threshold = 26 / geom.current.scale
    let best: { id: string; d: number } | null = null
    for (const e of shown) {
      const d = Math.hypot(e.x - p.x, e.t - p.t)
      if (d < threshold && (!best || d < best.d)) best = { id: e.id, d }
    }
    if (!best) return

    // Dokunulan olay çiftin başına geçer, eskisi ikinci sıraya kayar —
    // böylece karşılaştırma doğrudan tuvale dokunarak değiştirilebilir.
    const tapped = best.id
    setPair((prev) => (prev[0] === tapped ? prev : [tapped, prev[0]]))

    if (dragMode) {
      dragging.current = best.id
      ev.currentTarget.setPointerCapture(ev.pointerId)
    }
  }

  const onPointerMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return
    const p = toWorld(ev.clientX, ev.clientY)
    if (!p) return
    const id = dragging.current
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

  const relText = {
    future: 'aralarında sinyal gidebilir',
    past: 'aralarında sinyal gidebilir',
    lightlike: 'tam ışık hızında bağlı',
    elsewhere: 'aralarında hiçbir sinyal gidemez',
  }[verdict?.rel ?? 'elsewhere']

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div className="min-w-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface">
          <canvas
            className="absolute inset-0"
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ touchAction: dragMode ? 'none' : 'pan-y' }}
          />
          <div className="pointer-events-none absolute top-3 left-3 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[0.7rem] text-muted">
            {mode === 'rest' ? 'sen duruyorsun' : `β = ${formatTR(beta, 2)} ile gidiyorsun`}
          </div>
        </div>
        <TouchHint>
          {dragMode
            ? 'Olayları parmağınla sürükle. Sayfayı kaydırmak için taşıma modunu kapat.'
            : 'Bir olaya dokun, karşılaştırmaya alınsın. Kesikli sarı çizgiler ışığın yoludur.'}
        </TouchHint>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Sahne">
          <SegmentedControl
            value={scenario}
            onChange={(v) => loadScenario(v as keyof typeof SCENARIOS)}
            options={Object.entries(SCENARIOS).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <div className="mt-3">
            <Slider
              label="Ne kadar hızlı gidiyorsun?"
              hint="Işık hızının kesri olarak. Yürüyen biri için bu sayı milyarda birdir; burada görebilmek için abartıyoruz."
              value={beta}
              display={`β = ${formatTR(beta, 2)}`}
              min={-0.92}
              max={0.92}
              step={0.01}
              onChange={setBeta}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <PillButton active={mode === 'moving'} onClick={() => setMode(mode === 'rest' ? 'moving' : 'rest')}>
              {mode === 'moving' ? 'Kendi gözünden' : 'Dışarıdan bak'}
            </PillButton>
            <PillButton active={dragMode} onClick={() => setDragMode((v) => !v)}>
              Olayları taşı
            </PillButton>
            <PillButton onClick={() => loadScenario(scenario)}>Sıfırla</PillButton>
          </div>
        </Panel>

        {verdict && (
          <Panel title="İki olayı karşılaştır" hint={relText}>
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {[0, 1].map((slot) => (
                <div key={slot}>
                  <div className="mb-1 text-[0.75rem] text-muted">
                    {slot === 0 ? 'Birinci olay' : 'İkinci olay'}
                  </div>
                  <div className="no-scrollbar card-inset flex min-w-0 gap-1 overflow-x-auto p-1">
                    {events.map((e) => {
                      const selected = pair[slot] === e.id
                      return (
                        <button
                          key={e.id}
                          onClick={() =>
                            setPair((prev) => {
                              const next: [string, string] = [...prev]
                              next[slot] = e.id
                              if (next[0] === next[1]) next[1 - slot] = prev[slot]
                              return next
                            })
                          }
                          className="rounded-lg px-2.5 py-1.5 font-mono text-[0.8rem] font-medium transition-colors"
                          style={
                            selected
                              ? { background: pal[e.tone], color: pal.bg }
                              : { color: pal.muted }
                          }
                        >
                          {e.short}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl border p-3"
              style={{
                borderColor: verdict.flipped ? pal.clay : pal.border,
                background: verdict.flipped ? alpha(pal.clay, 0.08) : 'transparent',
              }}
            >
              <p className="text-[0.95rem] leading-relaxed text-ink">
                Sana göre önce{' '}
                <span className="font-medium" style={{ color: pal[verdict.nowFirst.tone] }}>
                  {verdict.nowFirst.name}
                </span>{' '}
                oldu.
                {verdict.flipped && (
                  <>
                    {' '}
                    <span className="font-medium text-clay">Sıra değişti</span> — duran biri
                    bunun tersini görüyor.
                  </>
                )}
              </p>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
                {verdict.rel === 'elsewhere' ? (
                  <>
                    Bu iki olay birbirine hiçbir sinyal gönderemez. Sıraları β ={' '}
                    <span className="tnum font-mono text-ink">
                      {formatTR(verdict.critical, 2)}
                    </span>{' '}
                    civarında dönüyor — ve dönmesinin kimseye bir zararı yok, çünkü aralarında
                    kurulabilecek bir neden-sonuç ilişkisi zaten yok.
                  </>
                ) : (
                  <>
                    Bu ikisi arasında bir sinyal gidebilir; biri diğerinin sebebi olabilir.{' '}
                    <span className="text-ink">Hiçbir hız sıralarını ters çeviremez.</span> Kaydırıcıyı
                    sonuna kadar götür, denemesi bedava.
                  </>
                )}
              </p>
            </div>
          </Panel>
        )}

        <Panel title="Sana göre günün sırası">
          <ol className="flex flex-wrap items-center gap-1.5">
            {ordering.map((e, i) => (
              <li key={e.id} className="flex items-center gap-1.5">
                <span
                  className="tnum rounded-lg px-2.5 py-1 font-mono text-[0.78rem] font-medium"
                  style={{ background: alpha(pal[e.tone], 0.16), color: pal[e.tone] }}
                >
                  {e.short}
                </span>
                {i < ordering.length - 1 && <span className="text-muted">→</span>}
              </li>
            ))}
          </ol>
        </Panel>

        <Legend
          items={[
            { color: pal.d5, label: 'ışığın yolu (45°)', dashed: true },
            { color: pal.mint, label: 'senin eksenlerin ve şimdilerin' },
          ]}
        />
      </div>
    </div>
  )
}
