import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SECTIONS } from '../data/sections'
import { ThemeToggle } from './ui'

/**
 * Üst gezinme çubuğu.
 *
 * Mobilde tam ekran menü, masaüstünde yatay şerit. En üstteki ince çizgi
 * sayfada ne kadar ilerlendiğini gösterir — bir kitabın kalınlığı gibi.
 */
export function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(SECTIONS[0].id)
  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)

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
          scrolled ? 'border-b border-line backdrop-blur-xl' : ''
        }`}
        style={{ background: scrolled ? 'var(--c-bg-blur)' : 'transparent' }}
      >
        <div
          className="h-[2px] origin-left bg-mint"
          style={{ transform: `scaleX(${progress})` }}
        />
        <div className="shell flex h-14 items-center justify-between gap-3 md:h-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5"
            aria-label="Başa dön"
          >
            <span className="relative grid h-7 w-7 shrink-0 place-items-center">
              <span className="absolute inset-0 rounded-md border border-mint" />
              <span className="absolute inset-x-[3px] top-1/2 h-[2px] -translate-y-1/2 rotate-[-14deg] bg-mint" />
            </span>
            <span className="font-display text-[1.08rem] font-medium text-ink">Blok Evren</span>
          </button>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[0.85rem] transition-colors ${
                  active === s.id ? 'font-medium text-mint' : 'text-muted hover:text-ink'
                }`}
              >
                {s.nav}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-full border border-line-strong px-3.5 text-[0.8rem] font-medium text-muted lg:hidden"
              aria-expanded={open}
              aria-label="Bölüm menüsü"
            >
              <span className="tnum font-mono text-mint">
                {SECTIONS.find((s) => s.id === active)?.index ?? '00'}
              </span>
              {open ? 'Kapat' : 'Bölümler'}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg pt-16 lg:hidden"
          >
            <nav className="shell flex flex-col gap-0.5 py-4">
              {SECTIONS.map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.24 }}
                  onClick={() => go(s.id)}
                  className={`flex items-baseline gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                    active === s.id ? 'bg-surface-2 text-mint' : 'text-ink'
                  }`}
                >
                  <span className="tnum font-mono text-[0.75rem] text-muted">{s.index}</span>
                  <span className="font-display text-[1.2rem]">{s.nav}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
