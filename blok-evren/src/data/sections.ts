/** Gezinme çubuğu ve kaydırma takibi için bölüm listesi. */
export interface SectionMeta {
  id: string
  nav: string
  index: string
}

export const SECTIONS: SectionMeta[] = [
  { id: 'blok', nav: 'Blok', index: '01' },
  { id: 'esanlilik', nav: 'Eşzamanlılık', index: '02' },
  { id: 'andromeda', nav: 'Andromeda', index: '03' },
  { id: 'isik-konisi', nav: 'Işık konisi', index: '04' },
  { id: 'ikizler', nav: 'İkizler', index: '05' },
  { id: 'ontoloji', nav: 'Üç görüş', index: '06' },
  { id: 'akis', nav: 'Akış', index: '07' },
  { id: 'irade', nav: 'Özgür irade', index: '08' },
  { id: 'kaynaklar', nav: 'Kaynaklar', index: '09' },
]
