# Blok Evren — Dün hâlâ bir yerde mi?

Geçmiş, şimdi ve gelecek aynı anda var olabilir mi? Blok evren fikrini gündelik
hayattan örneklerle, elle oynanan simülasyonlarla ve 3B görselleştirmelerle
anlatan, mobil öncelikli bir web uygulaması. Sunucu gerektirmez; tamamen
tarayıcıda çalışır.

## İçerik

| # | Bölüm | Ne yapabilirsin |
|---|-------|-----------------|
| 01 | Bir salı günü, baştan sona | Bir günün 3B bloğunu çevir, "şimdi" düzlemini eğ; sen, annen ve trendeki yolcunun saatlerinin ayrışmasını canlı listede izle |
| 02 | "Aynı anda" diye bir yer yok | Dört gündelik olayı sürükle, hızını değiştir, istediğin iki olayı seçip sıralarının dönüp dönmediğini gör |
| 03 | Şimdi ne kadar uzağa uzanır? | Karşı koltuktan Andromeda'ya: aynı yürüyüş, attosaniyeden günlere uzanan kayma |
| 04 | Kime ulaşabilirsin? | Işık konisinde bir olay gezdir, merkezden çıkan ışık darbesinin ona yetişip yetişmediğini izle |
| 05 | İki yol, iki ömür | Kendi yaşını gir; Deniz ile Kaya'nın yolculuk sonunda kaç yaşında olacağını ve dönüşteki eşzamanlılık sıçramasını gör |
| 06 | Fizik şekli veriyor, varlığı vermiyor | Üç ontolojiyi yan yana canlandır, üç soruluk yoklamayla kendi sezgini yokla |
| 07 | Akmıyorsa, bu his ne? | Çaya damlayan sütü izle, bardağa dokunup damlayı kendin koy, filmi geri sar |
| 08 | Yazılmışsa, seçen kim? | Rietdijk–Putnam zinciri ve her halkasına verilen ciddi itirazlar |
| 09 | Buradan sonrası | İlk elden okuma listesi |

Bütün sayısal değerler `src/lib/relativity.ts` içindeki gerçek Lorentz
dönüşümlerinden gelir; hiçbir simülasyonda "anlaşılsın diye" uydurulmuş sabit
yoktur. Tek istisna mesafe şemasındaki çizgi eğimleridir — β ≈ 10⁻⁹ gözle
görülemeyeceği için abartılmıştır ve bu tuvalin üzerinde açıkça yazar.

## Teknoloji

- **Vite 8** + **React 19** + **TypeScript**
- **three.js** / **@react-three/fiber** / **@react-three/drei** — 3B sahneler
- **Tailwind CSS v4** — mobil öncelikli stil
- **motion** — bölüm geçişleri ve menü animasyonları
- 2B simülasyonlar el yazımı **Canvas 2D** ile (mobilde daha keskin ve ucuz)
- Tipografi: **Newsreader** (başlıklar), **Instrument Sans** (gövde),
  **JetBrains Mono** (sayılar)

### Tema

Renkler tek bir yerde, `src/index.css` içindeki CSS değişkenlerinde tanımlı.
Açık tema temeldir; koyu tema yalnızca değişkenleri yeniden tanımlar. Hiçbir
renk sadece bir `@media` ya da `[data-theme]` bloğunun içinde yaşamaz — böylece
ziyaretçi "sistem" ayarındayken de sayfa doğru çözümlenir.

Tuvaller ve WebGL sahneleri de kendi renk sabitlerini taşımaz;
`src/lib/theme.ts` üzerinden aynı değişkenleri okur ve tema değiştiğinde
birlikte döner. Üst çubuktaki düğme sistem → açık → koyu sırasıyla dolaşır ve
seçimi `localStorage`'a yazar.

Metin kontrastları hem açık hem koyu temada WCAG AA eşiğinin (normal metin için
4,5:1) üzerinde tutulur.

### Mobil başarım için yapılanlar

- Her WebGL tuvali yalnızca ekranda görünürken çalışır; dışarı çıkınca
  `frameloop="never"` ile donar (`SceneFrame`).
- `dpr` en fazla 1,75 ile sınırlı.
- Canlandırmalar React durumu yerine `ref` üzerinden nesneleri günceller;
  saniyede 60 kez yeniden render yoktur.
- Kahraman bölümünde ve ontoloji sahnesinde `OrbitControls` yoktur, böylece
  tam ekran tuval telefonda sayfa kaydırmayı çalmaz.
- 3B kameralar ekran oranına göre kendini kadraja sığdırır.
- Yatay kaydırmalı denetimler `min-w-0` taşır; aksi hâlde ızgara öğesinin
  otomatik en-küçük boyutu sayfanın tamamını genişletiyordu.

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
2. Netlify `netlify.toml`'u okuyup derleme ayarlarını kendisi doldurur.
3. **Deploy** de.

Uygulamayı kendi deposuna taşırsan `netlify.toml`'u yeni deponun köküne kopyala
ve `base` satırını sil.

## Lisans

MIT.
