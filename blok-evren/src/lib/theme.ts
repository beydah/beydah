import { useCallback, useEffect, useState } from 'react'

/**
 * Tema köprüsü.
 *
 * Renkler tek bir yerde, index.css'teki CSS değişkenlerinde tanımlı. Tuvaller
 * ve WebGL sahneleri kendi renk sabitlerini taşımak yerine bu değişkenleri
 * okur; böylece açık/koyu tema değiştiğinde çizimler de birlikte döner.
 */

const TOKENS = {
  bg: '--c-bg',
  surface: '--c-surface',
  surface2: '--c-surface-2',
  border: '--c-border',
  borderStrong: '--c-border-strong',
  text: '--c-text',
  muted: '--c-muted',
  faint: '--c-faint',
  mint: '--c-mint',
  mintBright: '--c-mint-bright',
  clay: '--c-clay',
  clayBright: '--c-clay-bright',
  grid: '--c-grid',
  d1: '--c-d1',
  d2: '--c-d2',
  d3: '--c-d3',
  d4: '--c-d4',
  d5: '--c-d5',
} as const

export type Palette = Record<keyof typeof TOKENS, string>

/** Değişkenler henüz okunamazsa kullanılacak açık tema değerleri. */
const FALLBACK: Palette = {
  bg: '#faf9f5',
  surface: '#ffffff',
  surface2: '#f2f0e8',
  border: '#e2ded1',
  borderStrong: '#cdc7b6',
  text: '#23211c',
  muted: '#57534a',
  faint: '#756f62',
  mint: '#0b7a5a',
  mintBright: '#14a87c',
  clay: '#a94f36',
  clayBright: '#d97757',
  grid: '#e6e2d6',
  d1: '#0b7a5a',
  d2: '#a94f36',
  d3: '#3f4fa8',
  d4: '#7d3f86',
  d5: '#856611',
}

function readPalette(): Palette {
  if (typeof window === 'undefined') return FALLBACK
  const cs = getComputedStyle(document.documentElement)
  const out = {} as Palette
  for (const [key, varName] of Object.entries(TOKENS)) {
    const value = cs.getPropertyValue(varName).trim()
    out[key as keyof Palette] = value || FALLBACK[key as keyof Palette]
  }
  return out
}

/**
 * Yürürlükteki paleti döndürür ve tema değişince kendini günceller.
 *
 * İki kaynağı birden dinler: işletim sistemi tercihi (prefers-color-scheme) ve
 * kök elemandaki data-theme damgası (ziyaretçinin açık seçimi ya da barındırıcı
 * uygulamanın damgası).
 */
export function useThemePalette(): Palette {
  const [palette, setPalette] = useState<Palette>(readPalette)

  useEffect(() => {
    const refresh = () => setPalette(readPalette())
    refresh()

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', refresh)

    const observer = new MutationObserver(refresh)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      mq.removeEventListener('change', refresh)
      observer.disconnect()
    }
  }, [])

  return palette
}

export type ThemeMode = 'system' | 'light' | 'dark'
const STORAGE_KEY = 'blok-evren-tema'

function currentMode(): ThemeMode {
  if (typeof document === 'undefined') return 'system'
  const stamped = document.documentElement.getAttribute('data-theme')
  return stamped === 'light' || stamped === 'dark' ? stamped : 'system'
}

/** Ziyaretçinin açık tema tercihi. 'system' damgayı tamamen kaldırır. */
export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(currentMode)

  useEffect(() => {
    const observer = new MutationObserver(() => setModeState(currentMode()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const setMode = useCallback((next: ThemeMode) => {
    if (next === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', next)
    }
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* depolama kapalı olabilir; tema yine de bu oturumda çalışır */
    }
    setModeState(next)
  }, [])

  return { mode, setMode }
}

/**
 * Renge saydamlık ekler. 3, 6 ve 8 haneli hex ile rgb()/rgba() girdilerini
 * kabul eder; CSS değişkenlerinden ne gelirse gelsin çizim kodu patlamaz.
 */
export function alpha(color: string, a: number): string {
  const c = color.trim()

  if (c.startsWith('#')) {
    let h = c.slice(1)
    if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('')
    if (h.length === 8) h = h.slice(0, 6)
    if (h.length !== 6) return c
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  const nums = c.match(/-?\d+\.?\d*/g)
  if (nums && nums.length >= 3) {
    return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${a})`
  }
  return c
}
