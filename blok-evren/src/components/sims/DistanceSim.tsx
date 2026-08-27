import { useCallback, useMemo, useState } from 'react'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { useInView } from '../../hooks/useInView'
import { alpha, useThemePalette } from '../../lib/theme'
import { C_KMS, formatTR, humanizeSeconds, simultaneityShiftSeconds } from '../../lib/relativity'
import { Callout, Panel, PillButton, SegmentedControl, Slider, Stat } from '../ui'

/**
 * "Şimdi" ne kadar uzağa uzanır?
 *
 * Aynı kaldırımda zıt yönlere yürüyen iki kişinin şimdileri Δt = βd/c kadar
 * kayar. Yan koltuktaki arkadaşın için bu attosaniyedir — yok sayılabilir.
 * Ama uzaklık büyüdükçe aynı adım günlere dönüşür. Anlatının çekirdeği bu:
 * kayma her zaman vardı, sadece bizim ölçeğimizde görünmüyordu.
 */

const KM_PER_LY = C_KMS * 31_557_600

interface Target {
  id: string
  label: string
  distanceLy: number
  pretty: string
  story: [string, string]
}

const TARGETS: Target[] = [
  {
    id: 'masa',
    label: 'Karşı koltuk',
    distanceLy: 0.002 / KM_PER_LY,
    pretty: '2 metre',
    story: ['Bardağı kaldırdı', 'Henüz kaldırmadı'],
  },
  {
    id: 'sokak',
    label: 'Sokağın sonu',
    distanceLy: 0.3 / KM_PER_LY,
    pretty: '300 metre',
    story: ['Otobüs kalktı', 'Otobüs hâlâ durakta'],
  },
  {
    id: 'ankara',
    label: 'Ankara',
    distanceLy: 350 / KM_PER_LY,
    pretty: '350 km',
    story: ['Telefonu açtı', 'Telefon hâlâ çalıyor'],
  },
  {
    id: 'ay',
    label: 'Ay',
    distanceLy: 384_400 / KM_PER_LY,
    pretty: '384 bin km',
    story: ['Adımını attı', 'Ayağı hâlâ havada'],
  },
  {
    id: 'yildiz',
    label: 'En yakın yıldız',
    distanceLy: 4.2465,
    pretty: '4,2 ışık yılı',
    story: ['Sonda indi', 'Sonda henüz inmedi'],
  },
  {
    id: 'andromeda',
    label: 'Andromeda',
    distanceLy: 2_537_000,
    pretty: '2,5 milyon ışık yılı',
    story: ['Filo yola çıktı', 'Filo karar bile almadı'],
  },
]

const SPEEDS = [
  { label: 'Yürüyüş', kmh: 5 },
  { label: 'Koşu', kmh: 12 },
  { label: 'Bisiklet', kmh: 25 },
  { label: 'Araba', kmh: 100 },
  { label: 'Uçak', kmh: 900 },
]

/** Kaymayı gündelik bir süreyle karşılaştırır. */
function anchor(seconds: number): string {
  const blink = 0.1 // bir göz kırpması
  if (seconds >= blink) return `bir göz kırpmasının ${formatTR(seconds / blink, 1)} katı`
  const ratio = blink / seconds
  if (ratio > 1e6) return `bir göz kırpmasının ${ratio.toExponential(0).replace('e+', '×10^')} da biri`
  return `bir göz kırpmasının ${formatTR(ratio, 0)} da biri`
}

export function DistanceSim() {
  const pal = useThemePalette()
  const [speed, setSpeed] = useState(5)
  const [targetId, setTargetId] = useState('masa')
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '120px' })

  const target = useMemo(() => TARGETS.find((t) => t.id === targetId)!, [targetId])
  const beta = speed / 3600 / C_KMS
  const shift = simultaneityShiftSeconds(speed, target.distanceLy)
  const total = shift * 2

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
      const leftX = Math.max(56, w * 0.14)
      const rightX = w - Math.max(62, w * 0.17)
      const midY = h * 0.52

      // --- Kaldırım çizgisi ---
      ctx.strokeStyle = pal.border
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 7])
      ctx.beginPath()
      ctx.moveTo(leftX, midY)
      ctx.lineTo(rightX, midY)
      ctx.stroke()
      ctx.setLineDash([])

      // --- Hedefteki zaman cetveli ---
      const rulerH = h * 0.6
      const rulerTop = midY - rulerH / 2
      ctx.strokeStyle = pal.borderStrong
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(rightX, rulerTop)
      ctx.lineTo(rightX, rulerTop + rulerH)
      ctx.stroke()

      const span = Math.max(total * 1.7, 1e-30)
      const yFor = (sec: number) => midY - (sec / span) * rulerH

      for (let i = -4; i <= 4; i += 1) {
        const y = midY + (i / 8) * rulerH
        const major = i === 0
        ctx.strokeStyle = major ? pal.muted : pal.border
        ctx.lineWidth = major ? 1.6 : 1
        ctx.beginPath()
        ctx.moveTo(rightX - (major ? 9 : 5), y)
        ctx.lineTo(rightX + (major ? 9 : 5), y)
        ctx.stroke()
      }

      // --- İki yürüyüşçünün şimdi doğruları ---
      const pairs = [
        { sec: shift, color: pal.d1, label: target.story[0] },
        { sec: -shift, color: pal.d2, label: target.story[1] },
      ]

      pairs.forEach(({ sec, color, label }) => {
        const y = yFor(sec)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(leftX, midY)
        ctx.lineTo(rightX, y)
        ctx.stroke()

        const pulse = 4.5 + Math.sin(time * 2.2) * 0.8
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(rightX, y, pulse, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = color
        ctx.font = "600 11.5px 'Instrument Sans', sans-serif"
        ctx.textAlign = 'right'
        ctx.textBaseline = sec > 0 ? 'bottom' : 'top'
        ctx.fillText(label, rightX - 13, sec > 0 ? y - 8 : y + 8)
      })

      // --- Kaldırımdaki iki kişi ---
      const bob = Math.sin(time * 3) * 2.2
      drawWalker(ctx, leftX, midY - 26 + bob, 1, pal.d1)
      drawWalker(ctx, leftX, midY + 26 - bob, -1, pal.d2)

      ctx.fillStyle = pal.mintBright
      ctx.beginPath()
      ctx.arc(leftX, midY, 6, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = pal.muted
      ctx.font = "500 11px 'Instrument Sans', sans-serif"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('aynı kaldırım', leftX, midY + 44)

      // --- Hedef ---
      ctx.fillStyle = pal.text
      ctx.font = "600 13px 'Instrument Sans', sans-serif"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(target.label, rightX, midY + rulerH / 2 + 12)
      ctx.fillStyle = pal.muted
      ctx.font = "500 10.5px 'JetBrains Mono', monospace"
      ctx.fillText(target.pretty, rightX, midY + rulerH / 2 + 32)

      // --- Şema notu ---
      ctx.fillStyle = pal.faint
      ctx.font = "500 10px 'JetBrains Mono', monospace"
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      ctx.fillText('şema · eğim görünürlük için abartıldı', 10, h - 8)
    },
    [shift, total, target, pal],
  )

  const canvasRef = useCanvas2D(draw, { animate: true, active: inView })

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-2xl border border-line bg-surface md:aspect-[16/10]">
        <canvas className="absolute inset-0" ref={canvasRef} />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Ne kadar uzağa bakıyorsun?">
          <SegmentedControl
            value={targetId}
            onChange={setTargetId}
            options={TARGETS.map((t) => ({ value: t.id, label: t.label }))}
          />
          <div className="mt-3 mb-2 flex flex-wrap gap-2">
            {SPEEDS.map((s) => (
              <PillButton key={s.label} active={Math.abs(speed - s.kmh) < 0.5} onClick={() => setSpeed(s.kmh)}>
                {s.label}
              </PillButton>
            ))}
          </div>
          <Slider
            label="Hızını kendin ayarla"
            value={speed}
            display={`${formatTR(speed, 0)} km/sa`}
            min={1}
            max={900}
            step={1}
            onChange={setSpeed}
          />
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Kişi başına kayma" value={humanizeSeconds(shift)} tone="d1" />
          <Stat label="İkisi arasındaki fark" value={humanizeSeconds(total)} tone="d2" />
          <Stat
            label="Hızın, ışığın kaçta kaçı"
            value={beta.toExponential(2).replace('.', ',').replace('e-', '×10⁻')}
            tone="mint"
          />
          <Stat label="Uzaklık" value={target.pretty} />
        </div>

        <Callout
          kind={total > 1 ? 'objection' : 'insight'}
          title={total > 1 ? 'Artık yok sayamazsın' : 'Var, ama hissedilmiyor'}
        >
          {target.label} için iki yürüyüşçünün şimdisi{' '}
          <span className="accent">{humanizeSeconds(total)}</span> ayrışıyor — {anchor(total)}.{' '}
          {total > 1 ? (
            <>
              Bu noktada soru kaçınılmaz oluyor: ikisinin “şu anda olan” dediği şey bu kadar
              farklıysa, hangisi gerçekten oluyor? “İkisi de” dersen, geleceğin bir kısmı şimdiden
              var demektir.
            </>
          ) : (
            <>
              Formül bir tane: Δt = β·d/c. Değişen tek şey d. Yani yan koltuktaki arkadaşınla
              aranızdaki bu minik ayrışma, Andromeda’daki günlerle{' '}
              <span className="text-ink">aynı olayın</span> farklı ölçekleri. Listeden daha
              uzağını seç.
            </>
          )}
        </Callout>
      </div>
    </div>
  )
}

/** Basit bir yürüyen figür: gövde, baş, yön oku. */
function drawWalker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
  color: string,
) {
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.arc(x, y - 7, 3.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x, y - 4)
  ctx.lineTo(x, y + 3)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x - 3.5, y + 8)
  ctx.lineTo(x, y + 3)
  ctx.lineTo(x + 3.5, y + 8)
  ctx.stroke()

  const ax = x + dir * 12
  ctx.beginPath()
  ctx.moveTo(x + dir * 7, y - 1)
  ctx.lineTo(ax, y - 1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(ax, y - 1)
  ctx.lineTo(ax - dir * 4, y - 4)
  ctx.moveTo(ax, y - 1)
  ctx.lineTo(ax - dir * 4, y + 2)
  ctx.stroke()

  ctx.fillStyle = alpha(color, 0.9)
}
