import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SECTIONS } from '../data/sections'

/**
 * Üst gezinme çubuğu.
 *
 * Mobilde tam ekran menü, masaüstünde yatay şerit. Kaydırma ilerlemesi en
 * üstteki ince çizgide, bulunulan bölüm ise etkin bağlantıda gösterilir.
 */
export function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(SECTIONS[0].id)
  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  // Kaydırma ilerlemesi
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? window.scrollY / max : 0)
        setScrolled(window.scrollY > 24)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bölüm takibi
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.6] },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Menü açıkken arka planın kaymasını engelle
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled ? 'border-b border-line/70 bg-void/85 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div
          className="h-px origin-left bg-gradient-to-r from-cyan-glow via-violet-glow to-amber-glow"
          style={{ transform: `scaleX(${progress})` }}
        />
        <div className="shell flex h-14 items-center justify-between md:h-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5"
            aria-label="Başa dön"
          >
            <span className="relative grid h-7 w-7 place-items-center">
              <span className="absolute inset-0 rotate-12 rounded-[7px] border border-cyan-glow/70" />
              <span className="absolute inset-[5px] rounded-[3px] bg-cyan-glow/25" />
            </span>
            <span className="font-display text-[0.92rem] font-semibold tracking-tight">
              Blok Evren
            </span>
          </button>

          {/* Masaüstü menü */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[0.8rem] transition-colors ${
                  active === s.id ? 'text-cyan-glow' : 'text-mist hover:text-chalk'
                }`}
              >
                {s.nav}
              </button>
            ))}
          </nav>

          {/* Mobil düğme */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 items-center gap-2 rounded-full border border-line px-3.5 text-[0.78rem] text-mist lg:hidden"
            aria-expanded={open}
            aria-label="Menüyü aç"
          >
            <span className="font-mono text-cyan-glow">
              {SECTIONS.find((s) => s.id === active)?.index ?? '00'}
            </span>
            {open ? 'Kapat' : 'Bölümler'}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-void/96 pt-16 backdrop-blur-xl lg:hidden"
          >
            <nav className="shell flex flex-col gap-0.5 py-4">
              {SECTIONS.map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.25 }}
                  onClick={() => go(s.id)}
                  className={`flex items-baseline gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                    active === s.id ? 'bg-cyan-glow/10 text-cyan-glow' : 'text-chalk/85'
                  }`}
                >
                  <span className="font-mono text-[0.72rem] text-mist">{s.index}</span>
                  <span className="font-display text-[1.05rem] font-medium">{s.nav}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
