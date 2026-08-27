import { useCallback, useEffect, useRef } from 'react'

export type Draw2D = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedSeconds: number,
) => void

interface Options {
  /** true ise her karede yeniden çizer (animasyonlu simülasyonlar için). */
  animate?: boolean
  /** false olduğunda döngü durur — ekran dışındaki tuvaller boşuna dönmez. */
  active?: boolean
}

/**
 * Retina-uyumlu 2B tuval kurulumu.
 *
 * devicePixelRatio ölçeklemesini, yeniden boyutlandırmayı ve isteğe bağlı
 * animasyon döngüsünü tek yerde toplar. `draw` fonksiyonunu useCallback ile
 * sarmalayın: kimliği değiştiğinde tuval yeniden çizilir.
 */
export function useCanvas2D(draw: Draw2D, { animate = false, active = true }: Options = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawRef = useRef(draw)
  const sizeRef = useRef({ width: 0, height: 0 })
  const startRef = useRef<number>(0)

  drawRef.current = draw

  const render = useCallback((elapsed: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { width, height } = sizeRef.current
    if (width === 0 || height === 0) return
    ctx.clearRect(0, 0, width, height)
    drawRef.current(ctx, width, height, elapsed)
  }, [])

  // Ölçü ve çözünürlük yönetimi
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const ctx = canvas.getContext('2d')
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { width, height }
      render(startRef.current)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [render])

  // Statik yeniden çizim: draw kimliği değiştiğinde
  useEffect(() => {
    if (animate && active) return
    render(startRef.current)
  }, [draw, animate, active, render])

  // Animasyon döngüsü
  useEffect(() => {
    if (!animate || !active) return
    let frame = 0
    let origin = 0

    const loop = (now: number) => {
      if (origin === 0) origin = now - startRef.current * 1000
      const elapsed = (now - origin) / 1000
      startRef.current = elapsed
      render(elapsed)
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [animate, active, render])

  return canvasRef
}
