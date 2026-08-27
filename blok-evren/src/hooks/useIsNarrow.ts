import { useEffect, useState } from 'react'

/**
 * Dar ekran (telefon) tespiti.
 *
 * 3B sahnelerin başlangıç kamera uzaklığını seçmek için kullanılır: aynı sahne
 * dar bir tuvalde daha uzaktan çekilmezse kenarları taşar.
 */
export function useIsNarrow(breakpoint = 640): boolean {
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setNarrow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [breakpoint])

  return narrow
}
