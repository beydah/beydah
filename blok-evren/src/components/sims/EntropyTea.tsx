import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { useInView } from '../../hooks/useInView'
import { alpha, useThemePalette } from '../../lib/theme'
import { formatTR } from '../../lib/relativity'
import { Callout, Panel, PillButton, Slider, Stat, TouchHint } from '../ui'

/**
 * Çaya damlayan süt.
 *
 * Damlacıkların hareket yasası zamanda tam tersinir: filmi geri oynattığında
 * her çarpışma fiziğe uyar, hiçbir kural çiğnenmez. Yine de geri oynatım
 * "yanlış" görünür. Fark yasalarda değil, başlangıç koşulunda — süt bardağa
 * toplu hâlde girdi. Blok evrende geçmişle geleceği ayıran şey de bu:
 * bloğun bir ucu derli toplu, öbür ucu değil.
 */

const N = 170
const STEPS = 720
const GRID = 10

interface Trajectory {
  pos: Float32Array
  entropy: Float32Array
}

function simulate(cx: number, cy: number): Trajectory {
  const pos = new Float32Array(STEPS * N * 2)
  const entropy = new Float32Array(STEPS)

  let seed = 424_242
  const rand = () => {
    seed = (seed * 1_664_525 + 1_013_904_223) % 4_294_967_296
    return seed / 4_294_967_296
  }

  const x = new Float32Array(N)
  const y = new Float32Array(N)
  const vx = new Float32Array(N)
  const vy = new Float32Array(N)

  // Başlangıç: süt tek bir damla hâlinde — olağanüstü derli toplu bir durum
  for (let i = 0; i < N; i += 1) {
    const a = rand() * Math.PI * 2
    const r = Math.sqrt(rand()) * 0.09
    x[i] = Math.min(0.97, Math.max(0.03, cx + Math.cos(a) * r))
    y[i] = Math.min(0.97, Math.max(0.03, cy + Math.sin(a) * r))
    const angle = rand() * Math.PI * 2
    const speed = 0.0016 + rand() * 0.0026
    vx[i] = Math.cos(angle) * speed
    vy[i] = Math.sin(angle) * speed
  }

  const counts = new Int32Array(GRID * GRID)

  for (let s = 0; s < STEPS; s += 1) {
    for (let i = 0; i < N; i += 1) {
      x[i] += vx[i]
      y[i] += vy[i]
      // Esnek duvar yansıması — tamamen tersinir
      if (x[i] < 0) {
        x[i] = -x[i]
        vx[i] = -vx[i]
      } else if (x[i] > 1) {
        x[i] = 2 - x[i]
        vx[i] = -vx[i]
      }
      if (y[i] < 0) {
        y[i] = -y[i]
        vy[i] = -vy[i]
      } else if (y[i] > 1) {
        y[i] = 2 - y[i]
        vy[i] = -vy[i]
      }
      pos[(s * N + i) * 2] = x[i]
      pos[(s * N + i) * 2 + 1] = y[i]
    }

    counts.fill(0)
    for (let i = 0; i < N; i += 1) {
      const gx = Math.min(GRID - 1, Math.max(0, Math.floor(x[i] * GRID)))
      const gy = Math.min(GRID - 1, Math.max(0, Math.floor(y[i] * GRID)))
      counts[gy * GRID + gx] += 1
    }
    let S = 0
    for (let k = 0; k < counts.length; k += 1) {
      if (counts[k] === 0) continue
      const p = counts[k] / N
      S -= p * Math.log(p)
    }
    entropy[s] = S
  }

  return { pos, entropy }
}

export function EntropyTea() {
  const pal = useThemePalette()
  const [drop, setDrop] = useState({ x: 0.22, y: 0.78 })
  const traj = useMemo(() => simulate(drop.x, drop.y), [drop])

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [reverse, setReverse] = useState(false)
  const stepRef = useRef(0)
  const geom = useRef({ ox: 0, oy: 0, size: 1 })
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '120px' })

  useEffect(() => {
    if (!playing || !inView) return
    let raf = 0
    let last = performance.now()
    let acc = 0

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      acc += dt
      const advance = Math.floor(acc * 90)
      if (advance > 0) {
        acc -= advance / 90
        let next = stepRef.current + (reverse ? -advance : advance)
        if (next >= STEPS) next = 0
        if (next < 0) next = STEPS - 1
        stepRef.current = next
        setStep(next)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, reverse, inView])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const stripH = 40
      const pad = 14
      const size = Math.min(w - pad * 2, h - pad * 2 - stripH)
      const ox = (w - size) / 2
      const oy = stripH + (h - stripH - size) / 2
      geom.current = { ox, oy, size }

      // --- Bardak: çayın rengi ---
      ctx.fillStyle = alpha(pal.d5, 0.13)
      roundRect(ctx, ox, oy, size, size, 14)
      ctx.fill()
      ctx.strokeStyle = pal.borderStrong
      ctx.lineWidth = 1.5
      roundRect(ctx, ox, oy, size, size, 14)
      ctx.stroke()

      // --- Kaba tane ızgarası ---
      ctx.strokeStyle = alpha(pal.borderStrong, 0.4)
      ctx.lineWidth = 1
      for (let i = 1; i < GRID; i += 1) {
        const p = (size * i) / GRID
        ctx.beginPath()
        ctx.moveTo(ox + p, oy)
        ctx.lineTo(ox + p, oy + size)
        ctx.moveTo(ox, oy + p)
        ctx.lineTo(ox + size, oy + p)
        ctx.stroke()
      }

      // --- Süt damlacıkları ---
      const base = step * N * 2
      for (let i = 0; i < N; i += 1) {
        const px = ox + traj.pos[base + i * 2] * size
        const py = oy + size - traj.pos[base + i * 2 + 1] * size
        ctx.fillStyle = i % 6 === 0 ? pal.d3 : pal.mintBright
        ctx.globalAlpha = i % 6 === 0 ? 0.95 : 0.8
        ctx.beginPath()
        ctx.arc(px, py, 2.7, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // --- Entropi şeridi ---
      const sMax = Math.log(GRID * GRID)
      ctx.fillStyle = pal.muted
      ctx.font = "500 10px 'JetBrains Mono', monospace"
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('dağınıklık', ox, 3)

      ctx.strokeStyle = pal.d4
      ctx.lineWidth = 1.8
      ctx.beginPath()
      for (let s = 0; s < STEPS; s += 2) {
        const px = ox + (s / (STEPS - 1)) * size
        const py = 18 + (stripH - 24) - (traj.entropy[s] / sMax) * (stripH - 24)
        if (s === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()

      const cx = ox + (step / (STEPS - 1)) * size
      ctx.strokeStyle = pal.text
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(cx, 15)
      ctx.lineTo(cx, stripH - 2)
      ctx.stroke()
    },
    [traj, step, pal],
  )

  const canvasRef = useCanvas2D(draw)

  /** Bardağa dokunulan yere yeni damla koyar ve evreni baştan hesaplar. */
  const onPointerDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const { ox, oy, size } = geom.current
    const x = (ev.clientX - rect.left - ox) / size
    const y = 1 - (ev.clientY - rect.top - oy) / size
    if (x < 0.05 || x > 0.95 || y < 0.05 || y > 0.95) return
    setDrop({ x, y })
    stepRef.current = 0
    setStep(0)
    setReverse(false)
    setPlaying(true)
  }

  const sMax = Math.log(GRID * GRID)
  const S = traj.entropy[step] ?? 0
  const spread = (S / sMax) * 100

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="min-w-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface">
          <canvas className="absolute inset-0" ref={canvasRef} onPointerDown={onPointerDown} />
          <div className="pointer-events-none absolute right-3 bottom-3 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[0.7rem] text-muted">
            {reverse ? 'geri sarılıyor' : 'ileri oynuyor'}
          </div>
        </div>
        <TouchHint>Bardağın içinde bir yere dokun — süt oraya damlasın.</TouchHint>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Zamanı elinle çevir">
          <Slider
            label="Kaçıncı an?"
            value={step}
            display={`${step} / ${STEPS - 1}`}
            min={0}
            max={STEPS - 1}
            step={1}
            onChange={(v) => {
              stepRef.current = v
              setStep(v)
              setPlaying(false)
            }}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <PillButton active={playing} onClick={() => setPlaying((v) => !v)}>
              {playing ? 'Duraklat' : 'Oynat'}
            </PillButton>
            <PillButton active={reverse} onClick={() => setReverse((v) => !v)}>
              Geri sar
            </PillButton>
            <PillButton
              onClick={() => {
                stepRef.current = 0
                setStep(0)
                setReverse(false)
                setPlaying(true)
              }}
            >
              Baştan
            </PillButton>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Dağınıklık" value={formatTR(S, 2)} tone="d4" />
          <Stat label="Bardağa yayılma" value={`%${formatTR(spread, 0)}`} tone="mint" />
        </div>

        <Callout kind="objection" title="Denklemlerde ok yok">
          Şimdi “geri sar”a bas. Süt kendiliğinden toplanıp yeniden damla oluyor — ve bu görüntü
          fiziğe <span className="accent">hiç aykırı değil</span>. Her damlacık aynı yasalara
          uyuyor, hiçbir kural çiğnenmiyor. Yasalar iki yönü de eşit derecede mümkün görüyor.
          Ayıran tek şey, sütün bardağa toplu hâlde girmiş olması.
        </Callout>

        <div className="card p-4">
          <p className="text-[0.95rem] leading-relaxed text-ink">
            Zamanın oku bir kuvvet değil, bir <span className="accent">başlangıç koşulu</span>.
            Evren olağanüstü derli toplu bir hâlden çıktı ve o günden beri dağılıyor. Blok
            evrende geçmişle geleceği ayıran şey de bu: blok bir yöne akmıyor, sadece bir ucu
            derli toplu, öbür ucu değil. Sen de o eğim boyunca hatırlıyorsun.
          </p>
        </div>
      </div>
    </div>
  )
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
