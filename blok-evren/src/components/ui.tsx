import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useThemeMode } from '../lib/theme'

/* ------------------------------------------------------------------ */
/* Bölüm iskeleti                                                      */
/* ------------------------------------------------------------------ */

interface SectionProps {
  id: string
  eyebrow: string
  title: string
  lead?: ReactNode
  children: ReactNode
  divider?: boolean
}

export function Section({ id, eyebrow, title, lead, children, divider = true }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 py-14 md:py-24">
      <div className="shell">
        {divider && <div className="mb-12 h-px w-full bg-line" />}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="measure mb-9 md:mb-12"
        >
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-[2rem] md:text-[2.9rem]">{title}</h2>
          {lead && <div className="lede mt-4">{lead}</div>}
        </motion.header>
        {children}
      </div>
    </section>
  )
}

/** Anlatı paragrafları — okuma ölçüsünde, gövde renginde. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="measure space-y-4 text-[1.02rem] leading-[1.7] text-ink">{children}</div>
}

/** Anlatının nefes aldığı yer: felsefi bir soru ya da itiraz. */
export function PullQuote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="measure my-10 border-l-2 border-mint pl-5 md:pl-6">
      <blockquote className="font-display text-[1.3rem] leading-[1.4] text-ink italic md:text-[1.55rem]">
        {children}
      </blockquote>
      {cite && <figcaption className="mt-2.5 text-[0.85rem] text-muted">— {cite}</figcaption>}
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Kart / panel                                                        */
/* ------------------------------------------------------------------ */

export function Panel({
  title,
  hint,
  children,
  className = '',
}: {
  title?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`card p-4 md:p-5 ${className}`}>
      {title && (
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-sans text-[0.95rem] font-semibold text-ink">{title}</h3>
          {hint && <span className="tnum font-mono text-[0.72rem] text-muted">{hint}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Kaydırıcı                                                           */
/* ------------------------------------------------------------------ */

export function Slider({
  label,
  value,
  display,
  min,
  max,
  step = 0.01,
  onChange,
  hint,
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  hint?: string
}) {
  return (
    <label className="block select-none">
      <span className="mb-0.5 flex items-baseline justify-between gap-3">
        <span className="text-[0.88rem] font-medium text-ink">{label}</span>
        <span className="tnum font-mono text-[0.88rem] font-medium text-mint">{display}</span>
      </span>
      {hint && <span className="mb-1 block text-[0.78rem] text-muted">{hint}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* Değer göstergesi                                                    */
/* ------------------------------------------------------------------ */

const TONE_TEXT = {
  default: 'text-ink',
  mint: 'text-mint',
  clay: 'text-clay',
  d1: 'text-d1',
  d2: 'text-d2',
  d3: 'text-d3',
  d4: 'text-d4',
  d5: 'text-d5',
} as const

export type Tone = keyof typeof TONE_TEXT

export function Stat({
  label,
  value,
  unit,
  tone = 'default',
}: {
  label: string
  value: string
  unit?: string
  tone?: Tone
}) {
  return (
    <div className="card-inset px-3 py-2.5">
      <div className="text-[0.73rem] leading-snug text-muted">{label}</div>
      <div className={`tnum font-mono text-[1.05rem] leading-tight font-medium ${TONE_TEXT[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-[0.72rem] text-muted">{unit}</span>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Seçim denetimleri                                                   */
/* ------------------------------------------------------------------ */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label?: string
}) {
  // min-w-0: içindeki yatay kaydırıcı, bu bileşen bir ızgara/esnek kutu öğesi
  // olduğunda kabın otomatik en-küçük boyutunu şişirip sayfayı genişletmesin.
  return (
    <div className="min-w-0">
      {label && <div className="mb-1.5 text-[0.88rem] font-medium text-ink">{label}</div>}
      <div
        role="tablist"
        aria-label={label}
        className="no-scrollbar card-inset flex min-w-0 gap-1 overflow-x-auto p-1"
      >
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(opt.value)}
              className={`flex-1 rounded-lg px-3 py-2 text-[0.84rem] font-medium whitespace-nowrap transition-colors ${
                selected
                  ? 'bg-mint text-bg'
                  : 'text-muted hover:bg-mint-soft hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PillButton({
  children,
  onClick,
  active = false,
  ariaLabel,
}: {
  children: ReactNode
  onClick: () => void
  active?: boolean
  ariaLabel?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-2 text-[0.84rem] font-medium transition-colors ${
        active
          ? 'border-mint bg-mint text-bg'
          : 'border-line-strong bg-surface text-muted hover:border-mint hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Vurgu kutusu                                                        */
/* ------------------------------------------------------------------ */

export function Callout({
  kind = 'insight',
  title,
  children,
}: {
  kind?: 'insight' | 'objection' | 'math'
  title: string
  children: ReactNode
}) {
  const border = kind === 'objection' ? 'border-clay' : 'border-mint'
  const label = kind === 'objection' ? 'text-clay' : 'text-mint'

  return (
    <div className={`rounded-xl border border-line border-l-2 ${border} bg-surface p-4 md:p-5`}>
      <div className={`mb-1.5 font-sans text-[0.82rem] font-semibold tracking-wide ${label}`}>
        {title}
      </div>
      <div className="text-[0.96rem] leading-relaxed text-ink">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Gösterge açıklaması                                                 */
/* ------------------------------------------------------------------ */

export function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-[0.8rem] text-muted">
          <span
            aria-hidden="true"
            className="inline-block h-[3px] w-5 rounded-full"
            style={{
              background: item.dashed
                ? `repeating-linear-gradient(90deg, ${item.color} 0 4px, transparent 4px 7px)`
                : item.color,
            }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export function TouchHint({ children }: { children: ReactNode }) {
  return <p className="mt-2.5 text-[0.8rem] leading-snug text-muted">{children}</p>
}

/* ------------------------------------------------------------------ */
/* Tema düğmesi                                                        */
/* ------------------------------------------------------------------ */

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode()

  // Sırayla dolaşır: sistem → açık → koyu → sistem
  const next = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
  const glyph = mode === 'system' ? '◐' : mode === 'light' ? '☀' : '☾'
  const name = mode === 'system' ? 'Sistem' : mode === 'light' ? 'Açık' : 'Koyu'

  return (
    <button
      onClick={() => setMode(next)}
      className="flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3 text-[0.78rem] font-medium text-muted transition-colors hover:border-mint hover:text-ink"
      aria-label={`Tema: ${name}. Değiştirmek için tıkla`}
      title={`Tema: ${name}`}
    >
      <span aria-hidden="true" className="text-[0.95rem] leading-none">
        {glyph}
      </span>
      <span className="hidden sm:inline">{name}</span>
    </button>
  )
}
