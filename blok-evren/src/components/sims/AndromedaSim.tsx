import { useCallback, useMemo, useState } from 'react'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { useInView } from '../../hooks/useInView'
import { PAL, hexAlpha } from '../../lib/palette'
import {
  C_KMS,
  SECONDS_PER_DAY,
  formatTR,
  humanizeSeconds,
  simultaneityShiftSeconds,
} from '../../lib/relativity'
import { Callout, Panel, SegmentedControl, Slider, Stat } from '../ui'

/**
 * Andromeda paradoksu (Penrose, 1989).
 *
 * Aynı kaldırımda zıt yönlere yürüyen iki kişinin "şimdi" düzlemleri,
 * Δt = βd/c kadar kayar. Yürüme hızında bu kayma Dünya'da mikrosaniyeden
 * küçüktür ama 2,5 milyon ışık yılı ötede günlere ulaşır.
 */

interface Target {
  id: string
  label: string
  distanceLy: number
  story: [string, string]
}

const TARGETS: Target[] = [
  {
    id: 'moon',
    label: 'Ay',
    distanceLy: 384_400 / (C_KMS * 31_557_600),
    story: ['Astronot adımını attı', 'Astronot henüz adımını atmadı'],
  },
  {
    id: 'proxima',
    label: 'Proxima Centauri',
    distanceLy: 4.2465,
    story: ['Sonda gezegene indi', 'Sonda henüz inmedi'],
  },
  {
    id: 'sgra',
    label: 'Galaksi merkezi',
    distanceLy: 26_000,
    story: ['Yıldız kara deliğe düştü', 'Yıldız hâlâ yörüngede'],
  },
  {
    id: 'andromeda',
    label: 'Andromeda',
    distanceLy: 2_537_000,
    story: ['Filo yola çıktı', 'Filo daha karar bile almadı'],
  },
]

export function AndromedaSim() {
  const [speed, setSpeed] = useState(5) // km/sa
  const [targetId, setTargetId] = useState('andromeda')
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '120px' })

  const target = useMemo(() => TARGETS.find((t) => t.id === targetId)!, [targetId])

  const beta = speed / 3600 / C_KMS
  const shiftSeconds = simultaneityShiftSeconds(speed, target.distanceLy)
  const totalSeconds = shiftSeconds * 2

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const leftX = Math.max(52, w * 0.13)
      const rightX = w - Math.max(58, w * 0.16)
      const midY = h / 2

      // --- Yıldız arka planı ---
      let seed = 987_654_321
      const rand = () => {
        seed = (seed * 1_664_525 + 1_013_904_223) % 4_294_967_296
        return seed / 4_294_967_296
      }
      for (let i = 0; i < 70; i += 1) {
        const x = rand() * w
        const y = rand() * h
        const r = rand() * 1.1 + 0.3
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.8 + i))
        ctx.fillStyle = hexAlpha(PAL.chalk, 0.35 * tw)
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // --- Uzay ekseni ---
      ctx.strokeStyle = hexAlpha(PAL.line, 1)
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 6])
      ctx.beginPath()
      ctx.moveTo(leftX, midY)
      ctx.lineTo(rightX, midY)
      ctx.stroke()
      ctx.setLineDash([])

      // --- Hedefteki zaman cetveli ---
      const rulerH = h * 0.66
      const rulerTop = midY - rulerH / 2
      ctx.strokeStyle = hexAlpha(PAL.mist, 0.55)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(rightX, rulerTop)
      ctx.lineTo(rightX, rulerTop + rulerH)
      ctx.stroke()

      // Cetvel ölçeği: toplam farkın 3 katını kapsasın
      const spanSeconds = Math.max(totalSeconds * 1.6, 1e-6)
      const secToPx = rulerH / spanSeconds
      const yFor = (sec: number) => midY - sec * secToPx

      // Cetvel çentikleri
      const niceStep = pickStep(spanSeconds)
      ctx.font = '500 9.5px JetBrains Mono, monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      for (let s = -spanSeconds / 2; s <= spanSeconds / 2; s += niceStep) {
        const y = yFor(s)
        if (y < rulerTop - 2 || y > rulerTop + rulerH + 2) continue
        const major = Math.abs(s) < niceStep * 0.01
        ctx.strokeStyle = hexAlpha(PAL.mist, major ? 0.8 : 0.35)
        ctx.lineWidth = major ? 1.6 : 1
        ctx.beginPath()
        ctx.moveTo(rightX - (major ? 10 : 6), y)
        ctx.lineTo(rightX + (major ? 10 : 6), y)
        ctx.stroke()
      }

      // --- İki yürüyüşçünün "şimdi" doğruları ---
      // Şema: gerçek eğim ~10⁻⁹, görünür olsun diye ölçeklenmiş çizim.
      const pairs: { sec: number; color: string; label: string; dir: string }[] = [
        { sec: shiftSeconds, color: PAL.cyan, label: target.story[0], dir: '→ hedefe doğru' },
        { sec: -shiftSeconds, color: PAL.rose, label: target.story[1], dir: '← hedeften uzağa' },
      ]

      pairs.forEach(({ sec, color, label }) => {
        const y = yFor(sec)
        ctx.strokeStyle = hexAlpha(color, 0.85)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(leftX, midY)
        ctx.lineTo(rightX, y)
        ctx.stroke()

        // Hedefteki işaret
        const pulse = 4.5 + Math.sin(t * 2.4) * 0.9
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.arc(rightX, y, pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Etiket
        ctx.fillStyle = color
        ctx.font = '500 10.5px Inter, sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = sec > 0 ? 'bottom' : 'top'
        const labelY = sec > 0 ? y - 9 : y + 9
        ctx.fillText(label, rightX - 12, labelY)
      })

      // --- Dünya ---
      ctx.fillStyle = PAL.cyan
      ctx.shadowColor = PAL.cyan
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.arc(leftX, midY, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = hexAlpha(PAL.chalk, 0.85)
      ctx.font = '500 10.5px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('Dünya · kaldırım', leftX, midY + 14)

      // Yürüyen iki kişi: küçük zıt oklar
      const bob = Math.sin(t * 3) * 2
      ctx.strokeStyle = PAL.cyan
      ctx.lineWidth = 2
      arrow(ctx, leftX + 12, midY - 20 + bob, leftX + 30, midY - 20 + bob)
      ctx.strokeStyle = PAL.rose
      arrow(ctx, leftX + 12, midY + 34 - bob, leftX - 6, midY + 34 - bob)

      // --- Hedef ---
      ctx.save()
      ctx.translate(rightX, midY)
      ctx.rotate(t * 0.05)
      ctx.strokeStyle = hexAlpha(PAL.violet, 0.75)
      ctx.lineWidth = 2
      for (let arm = 0; arm < 2; arm += 1) {
        ctx.beginPath()
        for (let k = 0; k <= 40; k += 1) {
          const a = (k / 40) * Math.PI * 1.6 + arm * Math.PI
          const r = 2 + k * 0.42
          const px = Math.cos(a) * r
          const py = Math.sin(a) * r * 0.42
          if (k === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }
      ctx.restore()

      ctx.fillStyle = hexAlpha(PAL.violet, 0.95)
      ctx.font = '600 11px Space Grotesk, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(target.label, rightX, midY + 26)
      ctx.fillStyle = hexAlpha(PAL.mist, 0.75)
      ctx.font = '500 9.5px JetBrains Mono, monospace'
      ctx.fillText(`${formatDistance(target.distanceLy)}`, rightX, midY + 42)

      // Şema uyarısı
      ctx.fillStyle = hexAlpha(PAL.mist, 0.55)
      ctx.font = '500 9px JetBrains Mono, monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      ctx.fillText('şema · eğimler görünürlük için abartılmıştır', 10, h - 8)
    },
    [shiftSeconds, totalSeconds, target],
  )

  const canvasRef = useCanvas2D(draw, { animate: true, active: inView })

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-2xl border border-line bg-void-2 md:aspect-[16/10]">
        <canvas className="absolute inset-0" ref={canvasRef} />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Kaldırımdaki iki kişi">
          <Slider
            label="Yürüme hızı"
            value={speed}
            display={`${formatTR(speed, 1)} km/sa`}
            min={0}
            max={12}
            step={0.1}
            onChange={setSpeed}
          />
          <div className="mt-3">
            <SegmentedControl
              label="Ne kadar uzağa bakıyoruz?"
              value={targetId}
              onChange={setTargetId}
              options={TARGETS.map((t) => ({ value: t.id, label: t.label }))}
            />
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="β = v/c" value={beta.toExponential(2).replace('.', ',')} tone="cyan" />
          <Stat
            label="Kişi başına kayma"
            value={humanizeSeconds(shiftSeconds)}
            tone="violet"
          />
          <Stat
            label="İkisi arasındaki fark"
            value={humanizeSeconds(totalSeconds)}
            tone="amber"
          />
          <Stat
            label="Gün cinsinden"
            value={formatTR(totalSeconds / SECONDS_PER_DAY, 2)}
            unit="gün"
            tone="rose"
          />
        </div>

        <Callout kind="math" title="Formül">
          Δt = β · d / c. Yürüme hızında β ≈ 5×10⁻⁹ — gülünecek kadar küçük. Ama d yeterince
          büyükse çarpım günlere çıkar. Uzaklık, küçüklüğü telafi eder.
        </Callout>
      </div>
    </div>
  )
}

/* ---------------- yardımcılar ---------------- */

function arrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const head = 5
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle - 0.5), y2 - head * Math.sin(angle - 0.5))
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle + 0.5), y2 - head * Math.sin(angle + 0.5))
  ctx.stroke()
}

/** Cetvel çentikleri için okunabilir bir adım seçer. */
function pickStep(span: number): number {
  const raw = span / 8
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-12))))
  const norm = raw / mag
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10
  return nice * mag
}

function formatDistance(ly: number): string {
  if (ly < 1e-5) return `${formatTR(ly * 9.4607e12, 0)} km`
  if (ly < 1) return `${formatTR(ly * 365.25, 2)} ışık günü`
  if (ly < 1000) return `${formatTR(ly, 2)} ışık yılı`
  if (ly < 1e6) return `${formatTR(ly / 1000, 1)} bin ışık yılı`
  return `${formatTR(ly / 1e6, 3)} milyon ışık yılı`
}
