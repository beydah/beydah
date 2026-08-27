import { useCallback, useEffect, useRef, useState } from 'react'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { useInView } from '../../hooks/useInView'
import { alpha, useThemePalette } from '../../lib/theme'
import { formatTR, gamma, humanizeYears, twinParadox } from '../../lib/relativity'
import { Callout, Legend, Panel, PillButton, Slider } from '../ui'

/**
 * İki yol, iki ömür.
 *
 * Deniz evde kalıyor, Kaya gidip dönüyor. Buluştuklarında Kaya daha genç —
 * ve bu bir hile değil, bir uzunluk farkı: uzayzamanda iki nokta arasındaki
 * yolların "süresi" farklıdır, tıpkı haritada iki şehir arasındaki yolların
 * kilometresinin farklı olması gibi.
 *
 * Asıl aydınlatıcı kısım pembe kesikli çizgi: dönüş anında Kaya'nın "şimdi
 * Deniz'de ne oluyor" cevabı bir anda sıçrar. Deniz'in hayatında hiçbir
 * tuhaflık yaşanmaz; değişen tek şey Kaya'nın bloğu hangi açıyla dilimlediği.
 */

const STAY = 'Deniz'
const GO = 'Kaya'

export function TwoRoadsSim() {
  const pal = useThemePalette()
  const [beta, setBeta] = useState(0.8)
  const [years, setYears] = useState(20)
  const [age, setAge] = useState(30)
  const [playing, setPlaying] = useState(true)
  const [showSimul, setShowSimul] = useState(true)

  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '120px' })

  const result = twinParadox(beta, years)
  const g = gamma(beta)
  const jumpYears = beta * beta * years

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let acc = 0
    const duration = 15

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (playing && inView) progressRef.current = (progressRef.current + dt / duration) % 1
      acc += dt
      if (acc >= 0.1) {
        acc = 0
        setProgress(progressRef.current)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const p = progressRef.current
      const T = years
      const dist = (beta * years) / 2

      const padL = 44
      const padR = 20
      const padT = 22
      const padB = 32
      const plotW = w - padL - padR
      const plotH = h - padT - padB

      const xMax = Math.max(dist * 1.25, 0.5)
      const sx = (x: number) => padL + (x / xMax) * plotW
      const sy = (t: number) => h - padB - (t / T) * plotH

      // --- Izgara ve eksen etiketleri ---
      ctx.strokeStyle = pal.grid
      ctx.lineWidth = 1
      ctx.font = "500 10px 'JetBrains Mono', monospace"
      ctx.fillStyle = pal.muted
      const tStep = niceStep(T)
      for (let tv = 0; tv <= T + 1e-6; tv += tStep) {
        const y = sy(tv)
        ctx.beginPath()
        ctx.moveTo(padL, y)
        ctx.lineTo(w - padR, y)
        ctx.stroke()
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${Math.round(tv)}`, padL - 7, y)
      }
      const xStep = niceStep(xMax)
      for (let xv = 0; xv <= xMax + 1e-6; xv += xStep) {
        ctx.beginPath()
        ctx.moveTo(sx(xv), padT)
        ctx.lineTo(sx(xv), h - padB)
        ctx.stroke()
      }

      ctx.fillStyle = pal.muted
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('yıl', 8, padT - 16)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('uzaklık →', w - padR, h - 8)

      // --- Işık çizgisi ---
      ctx.strokeStyle = alpha(pal.d5, 0.5)
      ctx.setLineDash([5, 6])
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(Math.min(xMax, T)), sy(Math.min(xMax, T)))
      ctx.stroke()
      ctx.setLineDash([])

      // --- Deniz: evde kalan ---
      ctx.strokeStyle = pal.d1
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(0), sy(T))
      ctx.stroke()

      // --- Kaya: gidip dönen ---
      ctx.strokeStyle = pal.d2
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(dist), sy(T / 2))
      ctx.lineTo(sx(0), sy(T))
      ctx.stroke()

      // --- Şu anki konumlar ---
      const tNow = p * T
      const outbound = tNow <= T / 2
      const xNow = outbound ? beta * tNow : beta * (T - tNow)
      const tauGo = tNow / g
      const earthNowForGo = outbound ? tNow - beta * xNow : tNow + beta * xNow

      if (showSimul) {
        ctx.strokeStyle = pal.d4
        ctx.setLineDash([4, 5])
        ctx.lineWidth = 1.8
        ctx.beginPath()
        ctx.moveTo(sx(xNow), sy(tNow))
        ctx.lineTo(sx(0), sy(clamp(earthNowForGo, 0, T)))
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = pal.d4
        ctx.beginPath()
        ctx.arc(sx(0), sy(clamp(earthNowForGo, 0, T)), 4.5, 0, Math.PI * 2)
        ctx.fill()

        if (Math.abs(tNow - T / 2) < T * 0.012) {
          const yA = sy(clamp((T / 2) * (1 - beta * beta), 0, T))
          const yB = sy(clamp((T / 2) * (1 + beta * beta), 0, T))
          ctx.fillStyle = alpha(pal.d4, 0.25)
          ctx.fillRect(sx(0) - 5, Math.min(yA, yB), 10, Math.abs(yB - yA))
          ctx.fillStyle = pal.d4
          ctx.font = "600 11px 'Instrument Sans', sans-serif"
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            `${formatTR(jumpYears, 1)} yıl sıçradı`,
            sx(0) + 11,
            (Math.min(yA, yB) + Math.max(yA, yB)) / 2,
          )
        }
      }

      drawMarker(ctx, sx(0), sy(tNow), pal.d1, pal.bg, `${STAY} ${formatTR(age + tNow, 0)}`)
      drawMarker(ctx, sx(xNow), sy(tNow), pal.d2, pal.bg, `${GO} ${formatTR(age + tauGo, 0)}`)

      // --- Dönüş noktası ---
      ctx.fillStyle = pal.muted
      ctx.beginPath()
      ctx.arc(sx(dist), sy(T / 2), 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = "500 10px 'JetBrains Mono', monospace"
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText('dönüş', sx(dist) - 8, sy(T / 2))
    },
    [beta, years, showSimul, g, jumpYears, age, pal],
  )

  const canvasRef = useCanvas2D(draw, { animate: true, active: inView })

  const finalStay = age + years
  const finalGo = age + result.travellerYears

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div className="min-w-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-surface sm:aspect-[4/3]">
          <canvas className="absolute inset-0" ref={canvasRef} />
        </div>
        <div className="mt-3">
          <Slider
            label="Yolculukta ilerle"
            value={progress}
            display={`%${formatTR(progress * 100, 0)}`}
            min={0}
            max={0.999}
            step={0.001}
            onChange={(v) => {
              progressRef.current = v
              setProgress(v)
              setPlaying(false)
            }}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Hikâyeyi kendine göre kur">
          <label className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[0.88rem] font-medium text-ink">Şu an kaç yaşındasın?</span>
            <input
              type="number"
              min={1}
              max={99}
              value={age}
              onChange={(e) => setAge(Math.max(1, Math.min(99, Number(e.target.value) || 0)))}
              className="tnum w-20 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-right font-mono text-[0.95rem] text-ink"
            />
          </label>
          <Slider
            label={`${GO} ne kadar hızlı gidiyor?`}
            value={beta}
            display={`β = ${formatTR(beta, 2)}`}
            min={0.1}
            max={0.98}
            step={0.01}
            onChange={setBeta}
          />
          <div className="mt-2">
            <Slider
              label="Yolculuk evde kaç yıl sürüyor?"
              value={years}
              display={`${years} yıl`}
              min={4}
              max={60}
              step={1}
              onChange={setYears}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <PillButton active={playing} onClick={() => setPlaying((v) => !v)}>
              {playing ? 'Duraklat' : 'Oynat'}
            </PillButton>
            <PillButton active={showSimul} onClick={() => setShowSimul((v) => !v)}>
              {GO}’nın şimdisi
            </PillButton>
            <PillButton
              onClick={() => {
                progressRef.current = 0
                setProgress(0)
                setPlaying(true)
              }}
            >
              Başa sar
            </PillButton>
          </div>
        </Panel>

        <div className="card p-4">
          <p className="text-[1.02rem] leading-relaxed text-ink">
            Yolculuk bittiğinde {STAY}{' '}
            <span className="tnum font-mono font-medium text-d1">{formatTR(finalStay, 0)}</span>{' '}
            yaşında olacak, {GO} ise{' '}
            <span className="tnum font-mono font-medium text-d2">{formatTR(finalGo, 0)}</span>.
            Aradaki fark: <span className="accent">{humanizeYears(result.differenceYears)}</span>.
          </p>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
            İkisi de her günü normal yaşadı. Kimsenin saati bozulmadı, kimse bir şey hissetmedi.
            Sadece iki farklı yol tuttular ve yolların uzunluğu farklıydı.
          </p>
        </div>

        <Callout kind="insight" title="Sıçrayan şey blok değil, bakış açısı">
          Dönüş anında {GO}’nın “{STAY} şu an ne yapıyor?” sorusuna verdiği cevap{' '}
          <span className="accent">{formatTR(jumpYears, 1)} yıl</span> ileri atlar. {STAY}’in
          hayatında o an hiçbir şey olmaz — hiçbir yıl kaybolmaz, hiçbir gün atlanmaz. Değişen
          tek şey, {GO}’nın bloğu hangi açıyla dilimlediğidir. Sanki bir haritada yürürken
          dönüp başka yöne bakmışsın gibi: manzara değişir, arazi değişmez.
        </Callout>

        <Legend
          items={[
            { color: pal.d1, label: `${STAY} — evde` },
            { color: pal.d2, label: `${GO} — yolda` },
            { color: pal.d4, label: `${GO}’nın şimdisi`, dashed: true },
          ]}
        />
      </div>
    </div>
  )
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  bg: string,
  label: string,
) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, 6.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.font = "600 11px 'Instrument Sans', sans-serif"
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const tw = ctx.measureText(label).width
  ctx.fillStyle = color
  roundRect(ctx, x + 10, y - 9, tw + 14, 18, 9)
  ctx.fill()
  ctx.fillStyle = bg
  ctx.fillText(label, x + 17, y + 0.5)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function niceStep(span: number): number {
  const raw = span / 5
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-6))))
  const norm = raw / mag
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10
  return nice * mag
}
