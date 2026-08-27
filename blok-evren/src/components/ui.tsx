import type { ReactNode } from 'react'
import { motion } from 'motion/react'

/* ------------------------------------------------------------------ */
/* Bölüm iskeleti                                                      */
/* ------------------------------------------------------------------ */

interface SectionProps {
  id: string
  eyebrow: string
  title: string
  lead?: ReactNode
  children: ReactNode
  /** Bölümün üstünde ince bir ayraç çizgisi gösterir. */
  divider?: boolean
}

export function Section({ id, eyebrow, title, lead, children, divider = true }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 py-14 md:py-24">
      <div className="shell">
        {divider && (
          <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-line to-transparent" />
        )}
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 max-w-2xl md:mb-12"
        >
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-[1.85rem] font-semibold md:text-[2.75rem]">{title}</h2>
          {lead && <div className="prose-lead mt-4 text-[1.02rem] md:text-lg">{lead}</div>}
        </motion.header>
        {children}
      </div>
    </section>
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
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-display text-sm font-semibold tracking-wide text-chalk md:text-base">
            {title}
          </h3>
          {hint && <span className="font-mono text-[0.68rem] text-mist">{hint}</span>}
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
  accent = 'cyan',
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  accent?: 'cyan' | 'violet' | 'amber'
}) {
  const accentText = {
    cyan: 'text-cyan-glow',
    violet: 'text-violet-glow',
    amber: 'text-amber-glow',
  }[accent]

  return (
    <label className="block select-none">
      <span className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-[0.82rem] font-medium text-mist">{label}</span>
        <span className={`font-mono text-[0.86rem] font-medium ${accentText}`}>{display}</span>
      </span>
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

export function Stat({
  label,
  value,
  unit,
  tone = 'default',
}: {
  label: string
  value: string
  unit?: string
  tone?: 'default' | 'cyan' | 'violet' | 'amber' | 'rose' | 'lime'
}) {
  const toneClass = {
    default: 'text-chalk',
    cyan: 'text-cyan-glow',
    violet: 'text-violet-glow',
    amber: 'text-amber-glow',
    rose: 'text-rose-glow',
    lime: 'text-lime-glow',
  }[tone]

  return (
    <div className="rounded-xl border border-line/70 bg-void/60 px-3 py-2.5">
      <div className="text-[0.68rem] tracking-wide text-mist uppercase">{label}</div>
      <div className={`font-mono text-[1.05rem] leading-tight font-medium ${toneClass}`}>
        {value}
        {unit && <span className="ml-1 text-[0.7rem] text-mist">{unit}</span>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Seçim düğmeleri                                                     */
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
  return (
    <div>
      {label && <div className="mb-1.5 text-[0.82rem] font-medium text-mist">{label}</div>}
      <div
        role="tablist"
        aria-label={label}
        className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-xl border border-line/70 bg-void/60 p-1.5"
      >
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(opt.value)}
              className={`flex-1 rounded-lg px-3 py-2 text-[0.8rem] font-medium whitespace-nowrap transition-colors ${
                selected
                  ? 'bg-cyan-glow/15 text-cyan-glow shadow-[inset_0_0_0_1px_rgba(53,224,255,0.35)]'
                  : 'text-mist hover:text-chalk'
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
      className={`rounded-full border px-3.5 py-2 text-[0.8rem] font-medium transition-colors ${
        active
          ? 'border-cyan-glow/50 bg-cyan-glow/15 text-cyan-glow'
          : 'border-line bg-void/60 text-mist hover:border-cyan-glow/40 hover:text-chalk'
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
  kind?: 'insight' | 'warning' | 'math'
  title: string
  children: ReactNode
}) {
  const style = {
    insight: { border: 'border-cyan-glow/30', bg: 'bg-cyan-glow/[0.06]', text: 'text-cyan-glow', icon: '◆' },
    warning: { border: 'border-amber-glow/30', bg: 'bg-amber-glow/[0.06]', text: 'text-amber-glow', icon: '▲' },
    math: { border: 'border-violet-glow/30', bg: 'bg-violet-glow/[0.06]', text: 'text-violet-glow', icon: '∑' },
  }[kind]

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4 md:p-5`}>
      <div className={`mb-1.5 flex items-center gap-2 font-display text-sm font-semibold ${style.text}`}>
        <span aria-hidden="true">{style.icon}</span>
        {title}
      </div>
      <div className="text-[0.92rem] leading-relaxed text-chalk/80">{children}</div>
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
        <li key={item.label} className="flex items-center gap-2 text-[0.76rem] text-mist">
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-5 rounded-full"
            style={{
              background: item.dashed
                ? `repeating-linear-gradient(90deg, ${item.color} 0 4px, transparent 4px 7px)`
                : item.color,
              boxShadow: `0 0 8px ${item.color}`,
            }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Dokunmatik ipucu                                                    */
/* ------------------------------------------------------------------ */

export function TouchHint({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-[0.72rem] text-mist/80">
      <span aria-hidden="true">☞</span>
      {children}
    </p>
  )
}
