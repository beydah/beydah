import type { Palette } from './theme'

/**
 * Bloğun içindeki gündelik hayat.
 *
 * Kutunun dikey ekseni soyut bir "t" değil, bir günün saatleri: en alt sabah
 * altı, en üst gece on. İçindeki eğriler de parçacık değil, insanlar — sen,
 * annen, trendeki bir yolcu. Blok evren tartışmasının bütün mesele ettiği şey
 * zaten bu: senin sıradan bir salı günün, baştan sona, tek parça hâlinde.
 */

export const BLOCK = { x: 3, y: 4, z: 3 } as const

/** Blok zamanının karşılık geldiği saat aralığı. */
const DAY_START_MIN = 6 * 60 // 06:00
const DAY_END_MIN = 22 * 60 // 22:00

export interface WorldlineDef {
  id: string
  name: string
  /** Palet anahtarı — renk temaya göre çözülür. */
  tone: keyof Palette
  /** O kişinin gün içinde nerede olduğu: t → [x, z] */
  path: (t: number) => [number, number]
  /** Işık ışını: tam 45 derece, blok duvarına çarpınca kesilir. */
  isLight?: boolean
  tRange?: [number, number]
  /** Panelde gösterilecek kısa açıklama. */
  note?: string
  /** Etiketin asılacağı blok zamanı. Çizgiler arasında kasten farklı
   *  seçilir; hepsi tepede olsaydı etiketler üst üste binerdi. */
  labelT: number
}

export const WORLDLINES: WorldlineDef[] = [
  {
    id: 'you',
    name: 'Sen',
    tone: 'd1',
    path: (t) => [0.5 * Math.sin(t * 0.5), 0.5 * Math.cos(t * 0.5)],
    note: 'evden işe, işten eve',
    labelT: 2.9,
  },
  {
    id: 'mother',
    name: 'Annen',
    tone: 'd3',
    path: (t) => [-1.55 + 0.35 * Math.sin(t * 0.8), 1.25],
    note: 'şehrin öbür ucunda',
    labelT: 1.4,
  },
  {
    id: 'train',
    name: 'Trendeki yolcu',
    tone: 'd2',
    path: (t) => [0.45 * t, -1.85],
    note: 'hızı görünsün diye abartıldı',
    labelT: 3.9,
  },
  {
    id: 'light',
    name: 'Bir ışık ışını',
    tone: 'd5',
    path: (t) => [t, 1.95],
    isLight: true,
    tRange: [-2.6, 2.6],
    note: 'her zaman tam 45°',
    labelT: -1.8,
  },
]

/**
 * "Şimdi" düzleminin bir dünya çizgisini kestiği anı bulur.
 * g(t) = t − βx(t) − t₀ = 0 denklemini tarama + ikiye bölme ile çözer.
 */
export function findSliceIntersection(
  def: WorldlineDef,
  beta: number,
  sliceT: number,
): [number, number, number] | null {
  const [t0, t1] = def.tRange ?? [-BLOCK.y, BLOCK.y]
  const g = (t: number) => t - beta * def.path(t)[0] - sliceT

  const steps = 160
  let prevT = t0
  let prevG = g(t0)

  for (let i = 1; i <= steps; i += 1) {
    const t = t0 + ((t1 - t0) * i) / steps
    const cur = g(t)
    if (prevG === 0) break
    if (prevG * cur < 0) {
      let lo = prevT
      let hi = t
      for (let k = 0; k < 28; k += 1) {
        const mid = (lo + hi) / 2
        if (g(lo) * g(mid) <= 0) hi = mid
        else lo = mid
      }
      const root = (lo + hi) / 2
      const [x, z] = def.path(root)
      return [x, root, z]
    }
    prevT = t
    prevG = cur
  }
  return null
}

/** Blok zamanını okunabilir saate çevirir: −4 → 06:00, +4 → 22:00. */
export function blockTimeToClock(t: number): string {
  const span = DAY_END_MIN - DAY_START_MIN
  const minutes = DAY_START_MIN + ((t + BLOCK.y) / (BLOCK.y * 2)) * span
  const clamped = Math.max(0, Math.min(24 * 60 - 1, minutes))
  const h = Math.floor(clamped / 60)
  const m = Math.floor(clamped % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** İki saat arasındaki farkı "18 dakika" gibi yazar. */
export function clockGap(tA: number, tB: number): string {
  const span = DAY_END_MIN - DAY_START_MIN
  const minutes = Math.abs(((tA - tB) / (BLOCK.y * 2)) * span)
  if (minutes < 1) return 'aynı an'
  if (minutes < 60) return `${Math.round(minutes)} dakika`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h} saat ${m} dakika` : `${h} saat`
}
