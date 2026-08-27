import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { useInView } from '../../hooks/useInView'
import { PAL, hexAlpha } from '../../lib/palette'
import { formatTR } from '../../lib/relativity'
import { Callout, Panel, PillButton, Slider, Stat } from '../ui'

/**
 * Zamanın oku ve entropi.
 *
 * Parçacıklar duvarlardan esnek biçimde sekiyor; hareket denklemleri zamanda
 * tam tersinir. Yine de ileri oynatınca "doğal", geri oynatınca "tuhaf"
 * görünüyor. Fark denklemlerde değil, başlangıç koşulunun olağanüstü
 * düzenliliğinde. Blok evrende geçmiş–gelecek asimetrisi de böyle okunur:
 * bloğun bir ucu düşük entropili, diğeri değil.
 */

const N = 160
const STEPS = 720
const GRID = 10

interface Trajectory {
  /** steps × N × 2 konum dizisi (0..1 aralığında). */
  pos: Float32Array
  entropy: Float32Array
}

function simulate(): Trajectory {
  const pos = new Float32Array(STEPS * N * 2)
  const entropy = new Float32Array(STEPS)

  // Sabit tohumlu rastgelelik: her yüklemede aynı evren
  let seed = 424_242
  const rand = () => {
    seed = (seed * 1_664_525 + 1_013_904_223) % 4_294_967_296
    return seed / 4_294_967_296
  }

  const x = new Float32Array(N)
  const y = new Float32Array(N)
  const vx = new Float32Array(N)
  const vy = new Float32Array(N)

  // Başlangıç: hepsi sol alt köşede sıkışık — olağanüstü düşük entropi
  for (let i = 0; i < N; i += 1) {
    x[i] = 0.02 + rand() * 0.16
    y[i] = 0.02 + rand() * 0.16
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

    // Kaba taneli entropi: S = −Σ pᵢ ln pᵢ
    counts.fill(0)
    for (let i = 0; i < N; i += 1) {
      const cx = Math.min(GRID - 1, Math.max(0, Math.floor(x[i] * GRID)))
      const cy = Math.min(GRID - 1, Math.max(0, Math.floor(y[i] * GRID)))
      counts[cy * GRID + cx] += 1
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

export function EntropyArrow() {
  const traj = useMemo(simulate, [])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [reverse, setReverse] = useState(false)
  const stepRef = useRef(0)
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
      // ~90 adım/saniye
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
      const pad = 16
      const size = Math.min(w, h) - pad * 2
      const ox = (w - size) / 2
      const oy = (h - size) / 2

      // Kutu
      ctx.strokeStyle = hexAlpha(PAL.line, 1)
      ctx.lineWidth = 1.5
      ctx.strokeRect(ox, oy, size, size)

      // Kaba tane ızgarası
      ctx.strokeStyle = hexAlpha(PAL.grid, 0.8)
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

      // Parçacıklar
      const base = step * N * 2
      for (let i = 0; i < N; i += 1) {
        const px = ox + traj.pos[base + i * 2] * size
        const py = oy + size - traj.pos[base + i * 2 + 1] * size
        ctx.fillStyle = i % 7 === 0 ? PAL.amber : PAL.cyan
        ctx.globalAlpha = i % 7 === 0 ? 0.95 : 0.7
        ctx.beginPath()
        ctx.arc(px, py, 2.4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Entropi eğrisi (kutunun altında değil, üstünde ince bir şerit)
      const stripH = Math.min(46, oy - 6)
      if (stripH > 14) {
        const sMax = Math.log(GRID * GRID)
        ctx.strokeStyle = hexAlpha(PAL.violet, 0.85)
        ctx.lineWidth = 1.6
        ctx.beginPath()
        for (let s = 0; s < STEPS; s += 2) {
          const px = ox + (s / (STEPS - 1)) * size
          const py = 4 + stripH - (traj.entropy[s] / sMax) * stripH
          if (s === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()

        // Şimdiki an
        const cx = ox + (step / (STEPS - 1)) * size
        ctx.strokeStyle = hexAlpha(PAL.amber, 0.9)
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(cx, 2)
        ctx.lineTo(cx, 6 + stripH)
        ctx.stroke()

        ctx.fillStyle = hexAlpha(PAL.mist, 0.8)
        ctx.font = '500 9px JetBrains Mono, monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('entropi', ox, 2)
      }
    },
    [traj, step],
  )

  const canvasRef = useCanvas2D(draw)

  const sMax = Math.log(GRID * GRID)
  const S = traj.entropy[step] ?? 0

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="relative aspect-square w-full min-w-0 overflow-hidden rounded-2xl border border-line bg-void-2">
        <canvas className="absolute inset-0" ref={canvasRef} />
        <div className="pointer-events-none absolute right-3 bottom-3 rounded-full border border-line bg-void/80 px-3 py-1 font-mono text-[0.68rem] text-mist">
          {reverse ? '◀ geri oynatılıyor' : '▶ ileri oynatılıyor'}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Panel title="Zamanı elinle çevir">
          <Slider
            label="Adım"
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
            accent="amber"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <PillButton active={playing} onClick={() => setPlaying((v) => !v)}>
              {playing ? '❚❚ Duraklat' : '▶ Oynat'}
            </PillButton>
            <PillButton active={reverse} onClick={() => setReverse((v) => !v)}>
              Zamanı tersine çevir
            </PillButton>
            <PillButton
              onClick={() => {
                stepRef.current = 0
                setStep(0)
                setReverse(false)
                setPlaying(true)
              }}
            >
              Başa sar
            </PillButton>
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Kaba taneli entropi" value={formatTR(S, 2)} tone="violet" />
          <Stat label="Doluluk" value={`${formatTR((S / sMax) * 100, 0)}%`} tone="cyan" />
        </div>

        <Callout kind="warning" title="Denklemlerde ok yok">
          Bu parçacıkların hareket yasası zamanda tam tersinir: filmi geri oynattığında da
          her çarpışma fiziğe uyar. Yine de geri oynatım "yanlış" görünüyor. Aradaki fark
          yasalarda değil, <span className="text-chalk">başlangıç koşulunda</span>: evren
          olağanüstü düşük entropiyle başladı. Blok evrende geçmiş ile gelecek arasındaki
          fark da tam olarak budur — bloğun bir ucu düzenli, diğer ucu değil.
        </Callout>
      </div>
    </div>
  )
}
