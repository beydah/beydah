# Blok Evren — Zaman Akmıyor, Sen Akıyorsun

Blok evren teorisini (eternalizm) 3B görselleştirmeler, animasyonlar ve
etkileşimli özel görelilik simülasyonlarıyla anlatan, mobil öncelikli bir web
uygulaması. Sunucu gerektirmez; tamamen tarayıcıda çalışır.

## İçerik

| # | Bölüm | Etkileşim |
|---|-------|-----------|
| 01 | Zaman bir boyuttur | 3B uzayzaman bloğu, eğilebilen "şimdi" düzlemi, dünya çizgileri |
| 02 | Eşzamanlılığın göreliliği | Minkowski laboratuvarı: iki çerçeve, sürüklenebilir olaylar, sıralama şeridi |
| 03 | Andromeda paradoksu | Yürüme hızı → uzak mesafede gün cinsinden eşzamanlılık kayması |
| 04 | Işık konisi ve nedensellik | 3B çift koni, deneme olayının nedensel sınıflandırması |
| 05 | İkizler paradoksu | Canlandırmalı dünya çizgileri, öz zaman saatleri, dönüşteki eşzamanlılık sıçraması |
| 06 | Üç rakip ontoloji | Şimdicilik / büyüyen blok / eternalizm karşılaştırması |
| 07 | Akış yanılsaması | Tersinir parçacık simülasyonu ve kaba taneli entropi |
| 08 | Özgür irade | Rietdijk–Putnam argümanı ve ona verilen itirazlar |
| 09 | Kaynaklar | İlk elden okuma listesi |

Bütün sayısal değerler `src/lib/relativity.ts` içindeki gerçek Lorentz
dönüşümlerinden gelir — hiçbir simülasyonda "yaklaşık gösterim" için uydurulmuş
sabit yoktur. Yalnızca Andromeda şemasındaki çizgi eğimleri, β ≈ 10⁻⁹ gözle
görülemeyeceği için abartılmıştır ve bu tuvalin üzerinde açıkça yazar.

## Teknoloji

- **Vite 8** + **React 19** + **TypeScript**
- **three.js** / **@react-three/fiber** / **@react-three/drei** — 3B sahneler
- **Tailwind CSS v4** — mobil öncelikli stil
- **motion** — bölüm geçişleri ve menü animasyonları
- 2B simülasyonlar el yazımı **Canvas 2D** ile (mobilde daha keskin ve ucuz)

### Mobil başarım için yapılanlar

- Her WebGL tuvali yalnızca ekranda görünürken çalışır; dışarı çıkınca
  `frameloop="never"` ile donar (`SceneFrame`).
- `dpr` en fazla 1,75 ile sınırlı.
- Canlandırmalar React durumu yerine `ref` üzerinden nesneleri günceller;
  saniyede 60 kez yeniden render yoktur.
- Kahraman bölümünde ve ontoloji sahnesinde `OrbitControls` yoktur, böylece
  tam ekran tuval telefonda sayfa kaydırmayı çalmaz.
- 3B kameralar ekran oranına göre kendini kadraja sığdırır.

## Geliştirme

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run preview
```

Tek dosyalık taşınabilir sürüm (her şey tek bir `index.html` içinde):

```bash
SINGLE=1 npm run build   # dist-single/index.html
```

## Netlify'a yayınlama

Depo kökündeki `netlify.toml` gerekli ayarları içerir:

```toml
[build]
  base = "blok-evren"
  command = "npm run build"
  publish = "dist"
```

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an
   existing project** → GitHub → bu depoyu seç.
2. Netlify `netlify.toml`'u okuyup derleme ayarlarını kendisi doldurur; bir şey
   değiştirmen gerekmez.
3. **Deploy** de. Birkaç dakika içinde `https://<site-adı>.netlify.app`
   adresinde yayında olur.

Uygulamayı kendi deposuna taşırsan `netlify.toml`'u yeni deponun köküne kopyala
ve `base` satırını sil.

## Lisans

MIT.
