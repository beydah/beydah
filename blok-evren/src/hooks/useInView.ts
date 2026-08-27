import { useEffect, useRef, useState } from 'react'

/**
 * Bir elemanın görüntü alanına girip girmediğini izler.
 *
 * Ağır 3B sahneleri yalnızca ekranda görünürken çalıştırmak için kullanılır;
 * mobilde aynı anda beş WebGL tuvalinin dönmesini engeller.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options?: {
  rootMargin?: string
  threshold?: number
  /** true ise eleman bir kez görününce kalıcı olarak "görünür" sayılır. */
  once?: boolean
}) {
  const { rootMargin = '160px', threshold = 0.01, once = false } = options ?? {}
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, inView }
}

/** Kullanıcı "hareketi azalt" dediyse animasyonları kısmak için. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}
