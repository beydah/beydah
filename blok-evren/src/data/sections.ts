/** Gezinme çubuğu ve kaydırma takibi için bölüm listesi. */
export interface SectionMeta {
  id: string
  nav: string
  index: string
}

export const SECTIONS: SectionMeta[] = [
  { id: 'blok', nav: 'Bir gün', index: '01' },
  { id: 'simdi', nav: 'Şimdi', index: '02' },
  { id: 'mesafe', nav: 'Mesafe', index: '03' },
  { id: 'dokunmak', nav: 'Dokunmak', index: '04' },
  { id: 'yol', nav: 'İki yol', index: '05' },
  { id: 'varlik', nav: 'Ne var?', index: '06' },
  { id: 'akis', nav: 'Akış', index: '07' },
  { id: 'secim', nav: 'Seçim', index: '08' },
  { id: 'kaynaklar', nav: 'Kaynaklar', index: '09' },
]
