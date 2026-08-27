import { useCallback, useEffect, useRef, useState } from 'react'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { useInView } from '../../hooks/useInView'
import { PAL, hexAlpha } from '../../lib/palette'
import { formatTR, gamma, humanizeYears, twinParadox } from '../../lib/relativity'
import { Callout, Legend, Panel, PillButton, Slider, Stat } from '../ui'

/**
 * İkizler paradoksu.
 *
 * Dikey eksen Dünya'nın koordinat zamanı, yatay eksen uzaklık. Yolcu ikiz
 * gidip döner; iki bacakta da γ aynı olduğu için öz zamanı T/γ olur.
 *
 * Asıl aydınlatıcı kısım eşzamanlılık doğrularıdır: dönüş anında yolcunun
 * çerçevesi değişir ve "Dünya'da şu an" saydığı an β²T kadar sıçrar. Blok
 * evren okumasında hiçbir şey gerçekten sıçramaz — yolcunun bloğu dilimleme
 * açısı değişir, blok değil.
 */

export function TwinParadoxSim() {
  const [beta, setBeta] = useState(0.8)
  const [years, setYears] = useState(20)
  const [playing, setPlaying] = useState(true)
  const [showSimul, setShowSimul] = useState(true)

  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0) // ekrandaki sayılar için ayna
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '120px' })

  const result = twinParadox(beta, years)
  const g = gamma(beta)
  const D = result.distanceLightYears
  const jumpYears = beta * beta * years

  // Animasyon: tuval 60 fps'te ref'ten okur, sayılar saniyede 10 kez güncellenir.
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let acc = 0
    const duration = 14 // saniye / tam yolculuk

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (playing && inView) {
        progressRef.current = (progressRef.current + dt / duration) % 1
      }
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

      const padL = 46
      const padR = 22
      const padT = 22
      const padB = 34
      const plotW = w - padL - padR
      const plotH = h - padT - padB

      const xMax = Math.max(dist * 1.25, 0.5)
      const sx = (x: number) => padL + (x / xMax) * plotW
      const sy = (t: number) => h - padB - (t / T) * plotH

      // --- Izgara ---
      ctx.strokeStyle = PAL.grid
      ctx.lineWidth = 1
      ctx.font = '500 9.5px JetBrains Mono, monospace'
      ctx.fillStyle = hexAlpha(PAL.mist, 0.7)
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
        const x = sx(xv)
        ctx.beginPath()
        ctx.moveTo(x, padT)
        ctx.lineTo(x, h - padB)
        ctx.stroke()
      }

      ctx.fillStyle = hexAlpha(PAL.mist, 0.85)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('yıl ↑', 8, padT - 14)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('ışık yılı →', w - padR, h - 8)

      // --- Işık çizgileri (45°, aynı ölçek değil ama eğim referansı) ---
      ctx.strokeStyle = hexAlpha(PAL.amber, 0.28)
      ctx.setLineDash([5, 6])
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(Math.min(xMax, T)), sy(Math.min(xMax, T)))
      ctx.stroke()
      ctx.setLineDash([])

      // --- Dünya ikizi ---
      ctx.strokeStyle = PAL.cyan
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(0), sy(T))
      ctx.stroke()

      // --- Yolcu ikiz ---
      ctx.strokeStyle = PAL.amber
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(sx(0), sy(0))
      ctx.lineTo(sx(dist), sy(T / 2))
      ctx.lineTo(sx(0), sy(T))
      ctx.stroke()

      // --- Şu anki konumlar ---
      const tNow = p * T
      const outbound = tNow <= T / 2
      const xNow = outbound ? beta * tNow : beta * (T - tNow)
      const tauTraveller = tNow / g

      // Yolcunun "Dünya'da şu an" saydığı zaman
      const earthNowForTraveller = outbound ? tNow - beta * xNow : tNow + beta * xNow

      if (showSimul) {
        ctx.strokeStyle = hexAlpha(PAL.rose, 0.75)
        ctx.setLineDash([4, 5])
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(sx(xNow), sy(tNow))
        ctx.lineTo(sx(0), sy(clamp(earthNowForTraveller, 0, T)))
        ctx.stroke()
        ctx.setLineDash([])

        // Dünya çizgisindeki işaret
        ctx.fillStyle = PAL.rose
        ctx.beginPath()
        ctx.arc(sx(0), sy(clamp(earthNowForTraveller, 0, T)), 4.5, 0, Math.PI * 2)
        ctx.fill()

        // Dönüşteki sıçramanın taradığı bant
        if (Math.abs(tNow - T / 2) < T * 0.012) {
          const yA = sy(clamp((T / 2) * (1 - beta * beta), 0, T))
          const yB = sy(clamp((T / 2) * (1 + beta * beta), 0, T))
          ctx.fillStyle = hexAlpha(PAL.rose, 0.22)
          ctx.fillRect(sx(0) - 5, Math.min(yA, yB), 10, Math.abs(yB - yA))
          ctx.fillStyle = PAL.rose
          ctx.font = '600 10px Inter, sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            `${formatTR(jumpYears, 1)} yıl sıçrar`,
            sx(0) + 10,
            (Math.min(yA, yB) + Math.max(yA, yB)) / 2,
          )
        }
      }

      // Dünya ikizinin saati
      drawClock(ctx, sx(0), sy(tNow), PAL.cyan, `${formatTR(tNow, 1)} y`)
      // Yolcu ikizin saati
      drawClock(ctx, sx(xNow), sy(tNow), PAL.amber, `${formatTR(tauTraveller, 1)} y`)

      // Dönüş noktası
      ctx.fillStyle = hexAlpha(PAL.chalk, 0.75)
      ctx.beginPath()
      ctx.arc(sx(dist), sy(T / 2), 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = '500 9.5px JetBrains Mono, monospace'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = hexAlpha(PAL.mist, 0.9)
      ctx.fillText('dönüş', sx(dist) - 8, sy(T / 2))
    },
    [beta, years, showSimul, g, jumpYears],
  )

  const canvasRef = useCanvas2D(draw, { animate: true, active: inView })

  const tNow = progress * years
  const tauNow = tNow / g

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="min-w-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-void-2 sm:aspect-[4/3]">
          <canvas className="absolute inset-0" ref={canvasRef} />
        </div>
        <div className="mt-3">
          <Slider
            label="Yolculukta ilerle"
            value={progress}
            display={`${formatTR(progress * 100, 0)}%`}
            min={0}
            max={0.999}
            step={0.001}
            onChange={(v) => {
              progressRef.current = v
              setProgress(v)
              setPlaying(false)
            }}
            accent="amber"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Panel title="Yolculuk ayarları" hint={`γ = ${formatTR(g, 3)}`}>
          <Slider
            label="Gemi hızı β = v/c"
            value={beta}
            display={formatTR(beta, 2)}
            min={0.1}
            max={0.98}
            step={0.01}
            onChange={setBeta}
          />
          <div className="mt-3">
            <Slider
              label="Dünya'da geçen toplam süre"
              value={years}
              display={`${years} yıl`}
              min={4}
              max={60}
              step={1}
              onChange={setYears}
              accent="violet"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <PillButton active={playing} onClick={() => setPlaying((v) => !v)}>
              {playing ? '❚❚ Duraklat' : '▶ Oynat'}
            </PillButton>
            <PillButton active={showSimul} onClick={() => setShowSimul((v) => !v)}>
              Eşzamanlılık doğrusu
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

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Dünya ikizi (şu an)" value={formatTR(tNow, 1)} unit="yıl" tone="cyan" />
          <Stat label="Yolcu ikiz (şu an)" value={formatTR(tauNow, 1)} unit="yıl" tone="amber" />
          <Stat
            label="Yolculuk sonu farkı"
            value={humanizeYears(result.differenceYears)}
            tone="rose"
          />
          <Stat
            label="Tek yön mesafe"
            value={`${formatTR(D, 1)}`}
            unit="ışık yılı"
            tone="violet"
          />
        </div>

        <Callout kind="insight" title="Sıçrayan şey blok değil, dilimleme açısı">
          Dönüş anında yolcunun eşzamanlılık doğrusu aniden eğim değiştirir ve Dünya'nın
          tarihinde <span className="font-mono text-amber-glow">{formatTR(jumpYears, 1)} yıl</span>{' '}
          bir anda "geçmişe" katılır. Dünya'da hiçbir tuhaflık yaşanmaz; değişen tek şey,
          yolcunun 4 boyutlu bloğu hangi açıyla dilimlediğidir.
        </Callout>

        <Legend
          items={[
            { color: PAL.cyan, label: 'Dünya ikizi' },
            { color: PAL.amber, label: 'yolcu ikiz' },
            { color: PAL.rose, label: 'yolcunun şimdisi', dashed: true },
          ]}
        />
      </div>
    </div>
  )
}

/* ---------------- yardımcılar ---------------- */

function drawClock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string,
) {
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.arc(x, y, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.font = '600 10.5px JetBrains Mono, monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const tw = ctx.measureText(label).width
  ctx.fillStyle = hexAlpha(PAL.void, 0.82)
  ctx.fillRect(x + 9, y - 8, tw + 10, 16)
  ctx.fillStyle = color
  ctx.fillText(label, x + 14, y + 0.5)
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

/** Eksen için okunabilir aralık seçer. */
function niceStep(span: number): number {
  const raw = span / 5
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-6))))
  const norm = raw / mag
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10
  return nice * mag
}
