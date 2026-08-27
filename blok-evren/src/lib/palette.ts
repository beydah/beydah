/** Tüm 2B tuvallerin paylaştığı renk paleti (index.css'teki tema ile eşleşir). */
export const PAL = {
  void: '#05070d',
  panel: '#0a0f1c',
  line: '#1d2942',
  grid: '#16223a',
  mist: '#8fa3c8',
  chalk: '#e8eefc',
  cyan: '#35e0ff',
  violet: '#a678ff',
  amber: '#ffc46b',
  rose: '#ff6b8b',
  lime: '#7dffb2',
} as const

/** Renge alfa ekler: hexAlpha('#35e0ff', 0.4) → 'rgba(53,224,255,0.4)' */
export function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
