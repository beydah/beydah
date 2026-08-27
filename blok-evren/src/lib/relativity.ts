/**
 * 1+1 boyutlu özel görelilik çekirdeği.
 *
 * Birim seçimi: c = 1. Yani zaman "saniye", uzay "ışık-saniyesi" cinsinden
 * ölçülür ve ışık ışınları diyagramda tam 45 derecelik doğrular olur.
 * Bütün simülasyonlar (Minkowski laboratuvarı, Andromeda, ikizler, blok
 * dilimleyici) koordinatlarını buradan alır.
 */

export const C_KMS = 299_792.458 // ışık hızı, km/s
export const SECONDS_PER_DAY = 86_400
export const SECONDS_PER_YEAR = 31_557_600 // Jülyen yılı
export const LIGHT_YEAR_KM = C_KMS * SECONDS_PER_YEAR

/** Uzayzamandaki bir olay: t = zaman, x = konum (c = 1). */
export interface Event2D {
  t: number
  x: number
}

/** Lorentz çarpanı γ = 1 / √(1 − β²). */
export function gamma(beta: number): number {
  const b = clampBeta(beta)
  return 1 / Math.sqrt(1 - b * b)
}

/** β'yı ışık hızının hemen altında tutar; γ'nın patlamasını engeller. */
export function clampBeta(beta: number, limit = 0.999_9): number {
  return Math.max(-limit, Math.min(limit, beta))
}

/**
 * Bir olayı, orijinal çerçeveye göre +x yönünde β hızıyla giden gözlemcinin
 * çerçevesine taşır.
 *   t' = γ(t − βx),  x' = γ(x − βt)
 */
export function boost(event: Event2D, beta: number): Event2D {
  const b = clampBeta(beta)
  const g = gamma(b)
  return {
    t: g * (event.t - b * event.x),
    x: g * (event.x - b * event.t),
  }
}

/** boost() işleminin tersi: hareketli çerçeveden durgun çerçeveye döner. */
export function unboost(event: Event2D, beta: number): Event2D {
  return boost(event, -clampBeta(beta))
}

/**
 * Uzayzaman aralığının karesi: s² = Δx² − Δt².
 * Negatif → zamansal (nedensel bağ mümkün), pozitif → uzaysal ("başka yerde"),
 * sıfır → ışıksal.
 */
export function intervalSquared(a: Event2D, b: Event2D): number {
  const dt = b.t - a.t
  const dx = b.x - a.x
  return dx * dx - dt * dt
}

export type CausalRelation = 'future' | 'past' | 'elsewhere' | 'lightlike'

/**
 * b olayının a olayına göre nedensel konumu. "elsewhere" bölgesindeki olayların
 * sırası çerçeveden çerçeveye değişebilir — blok evren tartışmasının kalbi.
 */
export function causalRelation(a: Event2D, b: Event2D, tol = 1e-9): CausalRelation {
  const s2 = intervalSquared(a, b)
  if (Math.abs(s2) <= tol) return 'lightlike'
  if (s2 > 0) return 'elsewhere'
  return b.t > a.t ? 'future' : 'past'
}

/** Hızlılık (rapidity) φ = artanh(β). Ard arda hızlanmalarda toplanabilir. */
export function rapidity(beta: number): number {
  return Math.atanh(clampBeta(beta))
}

export function betaFromRapidity(phi: number): number {
  return Math.tanh(phi)
}

/** Görelilikte hız toplama: β₁ ⊕ β₂ = (β₁ + β₂) / (1 + β₁β₂). */
export function addVelocities(b1: number, b2: number): number {
  return (b1 + b2) / (1 + b1 * b2)
}

/** Boyuna Doppler kayması: yaklaşan kaynak için > 1. */
export function dopplerFactor(beta: number): number {
  const b = clampBeta(beta)
  return Math.sqrt((1 + b) / (1 - b))
}

/**
 * Bir gözlemcinin "şimdi" düzleminin eğimi. β hızıyla giden gözlemci için
 * eşzamanlılık doğrusu t = βx + sabit; yani diyagramda eğim tam β kadardır.
 */
export function simultaneitySlope(beta: number): number {
  return clampBeta(beta)
}

/** Sabit hızlı bir gözlemcinin dünya çizgisi: x = βt, diyagramda eğim 1/β. */
export function worldlineX(beta: number, t: number, x0 = 0): number {
  return x0 + clampBeta(beta) * t
}

/**
 * β hızıyla giden gözlemci için, kendi "şimdi" düzlemi üzerinde x konumundaki
 * olayın durgun çerçevedeki zaman damgası: t = t₀ + βx.
 */
export function nowSliceTime(beta: number, x: number, t0 = 0): number {
  return t0 + clampBeta(beta) * x
}

/**
 * Andromeda paradoksu.
 *
 * Yürüme hızındaki bir gözlemcinin eşzamanlılık düzlemi, d uzaklığında
 * Δt = βd/c kadar kayar. İki yönde yürüyen iki kişi için toplam fark bunun
 * iki katıdır. Sonuç saniye cinsinden döner.
 */
export function simultaneityShiftSeconds(speedKmh: number, distanceLightYears: number): number {
  const beta = speedKmh / 3600 / C_KMS
  const distanceLightSeconds = distanceLightYears * SECONDS_PER_YEAR
  return beta * distanceLightSeconds
}

export interface TwinResult {
  /** Dünyada kalan ikizin yaşlanması (koordinat zamanı), yıl. */
  stayHomeYears: number
  /** Yolculuk yapan ikizin öz zamanı, yıl. */
  travellerYears: number
  /** Aradaki fark, yıl. */
  differenceYears: number
  /** Yolculuğun tek yön mesafesi, ışık yılı. */
  distanceLightYears: number
  gamma: number
}

/**
 * İkizler paradoksu: biri β hızıyla gidip aynı hızla dönüyor.
 * Yolcunun öz zamanı τ = T/γ; dönüş noktasındaki hız değişimi yolcunun
 * çerçevesini değiştirdiği için asimetri ortaya çıkar.
 */
export function twinParadox(beta: number, totalCoordinateYears: number): TwinResult {
  const b = clampBeta(Math.abs(beta))
  const g = gamma(b)
  const traveller = totalCoordinateYears / g
  return {
    stayHomeYears: totalCoordinateYears,
    travellerYears: traveller,
    differenceYears: totalCoordinateYears - traveller,
    distanceLightYears: (b * totalCoordinateYears) / 2,
    gamma: g,
  }
}

/** Parçalı-doğrusal bir dünya çizgisi boyunca birikmiş öz zaman. */
export function properTimeAlong(points: Event2D[]): number {
  let tau = 0
  for (let i = 1; i < points.length; i += 1) {
    const dt = points[i].t - points[i - 1].t
    const dx = points[i].x - points[i - 1].x
    const s2 = dt * dt - dx * dx
    tau += s2 > 0 ? Math.sqrt(s2) : 0
  }
  return tau
}

/** Saniyeyi insan diline çevirir: "3 gün 4 saat" gibi. */
export function humanizeSeconds(seconds: number): string {
  const s = Math.abs(seconds)
  if (s < 1) return `${(s * 1000).toFixed(1)} milisaniye`
  if (s < 60) return `${s.toFixed(1)} saniye`
  if (s < 3600) return `${(s / 60).toFixed(1)} dakika`
  if (s < SECONDS_PER_DAY) return `${(s / 3600).toFixed(1)} saat`
  if (s < SECONDS_PER_YEAR) {
    const days = Math.floor(s / SECONDS_PER_DAY)
    const hours = Math.round((s % SECONDS_PER_DAY) / 3600)
    return hours > 0 ? `${days} gün ${hours} saat` : `${days} gün`
  }
  return `${(s / SECONDS_PER_YEAR).toFixed(2)} yıl`
}

/** Yılı "12 yıl 4 ay" biçiminde yazar. */
export function humanizeYears(years: number): string {
  const whole = Math.floor(years)
  const months = Math.round((years - whole) * 12)
  if (whole === 0) return `${months} ay`
  return months > 0 ? `${whole} yıl ${months} ay` : `${whole} yıl`
}

/** Sayıyı Türkçe biçimde yazar (binlik ayracı nokta, ondalık virgül). */
export function formatTR(value: number, digits = 2): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}
