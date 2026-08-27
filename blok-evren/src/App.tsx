import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { ArgumentChain } from './components/ArgumentChain'
import { Callout, Section } from './components/ui'
import { BlockExplorer } from './components/sims/BlockExplorer'
import { MinkowskiLab } from './components/sims/MinkowskiLab'
import { AndromedaSim } from './components/sims/AndromedaSim'
import { LightConeExplorer } from './components/sims/LightConeExplorer'
import { TwinParadoxSim } from './components/sims/TwinParadoxSim'
import { OntologyExplorer } from './components/sims/OntologyExplorer'
import { EntropyArrow } from './components/sims/EntropyArrow'

const SOURCES = [
  {
    title: 'Presentism — Stanford Encyclopedia of Philosophy',
    note: 'Şimdicilik, büyüyen blok ve eternalizmin ontolojik karşılaştırması.',
    href: 'https://plato.stanford.edu/entries/presentism/',
  },
  {
    title: 'Eternalism — Internet Encyclopedia of Philosophy',
    note: 'Blok evrenin felsefi savunusu ve temel itirazlar.',
    href: 'https://iep.utm.edu/eternalism/',
  },
  {
    title:
      'V. Petkov — “Relativity of Simultaneity and Eternalism: In Defense of the Block Universe”',
    note: 'Eşzamanlılığın göreliliğinden blok evrene giden argümanın ayrıntılı hâli.',
    href: 'https://facultysites.etown.edu/silbermd/files/2011/11/RoSandBlockworld.pdf',
  },
  {
    title: 'Growing block universe — Wikipedia',
    note: 'Büyüyen blok görüşünün tarihçesi ve “şu an en son dilimde miyim?” itirazı.',
    href: 'https://en.wikipedia.org/wiki/Growing_block_universe',
  },
  {
    title: 'Eternalism (philosophy of time) — Wikipedia',
    note: 'Rietdijk–Putnam argümanı ve Andromeda paradoksuna genel bakış.',
    href: 'https://en.wikipedia.org/wiki/Eternalism_(philosophy_of_time)',
  },
  {
    title: 'Interactive Minkowski spacetime diagram — Terence Tao',
    note: 'Daha ileri düzey, iki çerçeveli etkileşimli uzayzaman diyagramı.',
    href: 'https://teorth.github.io/tao-web/apps/spacetime-diagram.html',
  },
  {
    title: 'Roger Penrose — The Emperor’s New Mind (1989)',
    note: 'Andromeda paradoksunun ilk anlatıldığı kaynak.',
    href: 'https://en.wikipedia.org/wiki/The_Emperor%27s_New_Mind',
  },
]

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />

        {/* 01 ------------------------------------------------------------ */}
        <Section
          id="blok"
          eyebrow="01 · Temel fikir"
          title="Zaman bir boyuttur, bir nehir değil"
          divider={false}
          lead={
            <>
              Minkowski 1908'de şunu söyledi: uzay ve zaman ayrı ayrı birer gölgeye
              dönüşecek, geriye yalnızca ikisinin birleşimi kalacak. Bu birleşime{' '}
              <strong className="font-medium text-chalk">uzayzaman</strong> diyoruz. Ve eğer
              zaman gerçekten bir boyutsa, tıpkı uzayın "buradan ötesi" gibi zamanın da
              "şimdiden ötesi" vardır — orada, sen bakmasan da.
            </>
          }
        >
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <p className="text-[0.95rem] leading-relaxed text-chalk/80">
              Aşağıdaki kutu bir <strong className="text-chalk">uzayzaman bloğu</strong>. Dikey
              eksen zaman, yatay eksenler uzay. İçindeki eğriler nesnelerin{' '}
              <strong className="text-chalk">dünya çizgileri</strong>: bir nesnenin tüm tarihi,
              doğumundan yok oluşuna kadar tek bir eğri olarak durur.
            </p>
            <p className="text-[0.95rem] leading-relaxed text-chalk/80">
              Bu resimde hiçbir şey hareket etmez. Ay "dönmez"; Ay'ın dünya çizgisi bir
              helezondur. Sen "yaşlanmazsın"; senin dünya çizgin boyunca farklı noktalarda
              farklı yaşlarda olursun. Hepsi aynı anda oradadır.
            </p>
            <p className="text-[0.95rem] leading-relaxed text-chalk/80">
              Sarı düzlem bir gözlemcinin <strong className="text-chalk">"şimdi"</strong>si. β
              kaydırıcısını çevir: düzlem eğilir. İşte bütün mesele bu eğimde — çünkü eğim
              değişince, "şu anda olan her şey" kümesi bütünüyle değişir.
            </p>
          </div>
          <BlockExplorer />
        </Section>

        {/* 02 ------------------------------------------------------------ */}
        <Section
          id="esanlilik"
          eyebrow="02 · Eşzamanlılığın göreliliği"
          title="“Aynı anda” diye mutlak bir şey yok"
          lead={
            <>
              Newton'da tek bir evrensel saat vardı. Einstein onu kırdı: ışık hızı herkes için
              aynıysa, "aynı anda" olmak gözlemciye bağlı hâle gelir. Aşağıdaki laboratuvarda
              olayları yerinde tut, sadece hızını değiştir — ve olayların{' '}
              <strong className="font-medium text-chalk">sırasının</strong> değiştiğini gör.
            </>
          }
        >
          <MinkowskiLab />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Callout kind="math" title="Neden sıra değişebiliyor?">
              Lorentz dönüşümünde t′ = γ(t − βx). İki olay arasındaki zaman farkı
              Δt′ = γ(Δt − βΔx). Eğer βΔx {'>'} Δt ise, Δt′ işaret değiştirir — sıra tersine
              döner. Bu ancak Δx {'>'} Δt olduğunda, yani olaylar{' '}
              <em className="not-italic text-chalk">uzaysal ayrılmışken</em> mümkündür.
            </Callout>
            <Callout kind="insight" title="Nedensellik neden kurtuluyor?">
              Aralarında ışıktan yavaş bir sinyal gidebilen olaylar için Δt {'>'} Δx'tir ve
              hiçbir β sırayı tersine çeviremez. Yani neden hep sonuçtan önce gelir. Görelilik
              zamanın sırasını yalnızca <em className="not-italic text-chalk">hiç kimsenin
              göremeyeceği</em> yerlerde bulanıklaştırır.
            </Callout>
          </div>
        </Section>

        {/* 03 ------------------------------------------------------------ */}
        <Section
          id="andromeda"
          eyebrow="03 · Andromeda paradoksu"
          title="Yürümeye başla, Andromeda’nın tarihi değişsin"
          lead={
            <>
              Penrose'un 1989'daki örneği: kaldırımda yan yana duran iki kişi, biri Andromeda'ya
              doğru bir adım atıyor. Yürüme hızı — saatte beş kilometre. Ama 2,5 milyon ışık
              yılı ötede, ikisinin "şimdi"si <strong className="font-medium text-chalk">günlerce</strong>{' '}
              ayrışıyor.
            </>
          }
        >
          <AndromedaSim />
          <div className="mt-6">
            <Callout kind="warning" title="Bu bir hile değil, geometri">
              Kimse Andromeda'ya sinyal gönderemiyor, kimse orada ne olduğunu göremiyor —
              ışığın oradan gelmesi 2,5 milyon yıl sürüyor. Ama argüman şunu soruyor: iki
              kişinin "şu anda gerçek olan" kümesi bu kadar farklıysa, bu kümelerden hangisi
              gerçekten gerçek? Cevap "ikisi de" ise, gelecek de en az şimdi kadar var
              demektir.
            </Callout>
          </div>
        </Section>

        {/* 04 ------------------------------------------------------------ */}
        <Section
          id="isik-konisi"
          eyebrow="04 · Nedensellik"
          title="Işık konisi: evrenin hız limiti bir geometridir"
          lead={
            <>
              Her olay bir çift koninin tepesinde oturur. Yukarıdaki koni etkileyebileceğin her
              şey, aşağıdaki koni seni etkilemiş olabilecek her şey. Aradaki geniş bölge —
              "başka yerde" — nedensel olarak sana kapalıdır. Ve sırası da tartışmalıdır.
            </>
          }
        >
          <LightConeExplorer />
        </Section>

        {/* 05 ------------------------------------------------------------ */}
        <Section
          id="ikizler"
          eyebrow="05 · İkizler paradoksu"
          title="Aynı iki nokta, farklı uzunlukta yollar"
          lead={
            <>
              İkizlerden biri gidip dönüyor, diğeri Dünya'da kalıyor. Buluştuklarında yolcu
              daha genç. Paradoks değil bu: uzayzamanda iki nokta arasındaki farklı yolların{' '}
              <strong className="font-medium text-chalk">öz uzunlukları</strong> farklıdır —
              tıpkı haritada düz yolun virajlı yoldan kısa olması gibi, ama işaret ters.
            </>
          }
        >
          <TwinParadoxSim />
        </Section>

        {/* 06 ------------------------------------------------------------ */}
        <Section
          id="ontoloji"
          eyebrow="06 · Üç rakip görüş"
          title="Ne var? Şimdi mi, geçmiş mi, hepsi mi?"
          lead={
            <>
              Fizik bize geometriyi veriyor; "neyin var olduğu" sorusu felsefeye kalıyor. Üç
              ciddi cevap var ve üçü de bedelsiz değil.
            </>
          }
        >
          <OntologyExplorer />
        </Section>

        {/* 07 ------------------------------------------------------------ */}
        <Section
          id="akis"
          eyebrow="07 · Akış yanılsaması"
          title="Zaman akmıyorsa, bu akış hissi ne?"
          lead={
            <>
              Blok evrenin en zor sorusu bu. Blokta hiçbir şey hareket etmiyorsa, neden geçmişi
              hatırlayıp geleceği hatırlamıyoruz? Neden bardak kırılıyor da kendiliğinden
              birleşmiyor? Cevap ilginç bir yerde: yasalarda değil,{' '}
              <strong className="font-medium text-chalk">başlangıç koşulunda</strong>.
            </>
          }
        >
          <EntropyArrow />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card p-4">
              <div className="eyebrow mb-2 text-cyan-glow">Hafıza asimetrisi</div>
              <p className="text-[0.9rem] leading-relaxed text-chalk/78">
                Kayıt tutmak entropi üretir. Bir şeyi hatırlamak, düşük entropili bir geçmişe
                yaslanmayı gerektirir. Bu yüzden hafıza yalnızca tek yöne bakar — ve blokta
                nerede olursak olalım, "geçmiş" dediğimiz taraf hep düşük entropili taraftır.
              </p>
            </div>
            <div className="card p-4">
              <div className="eyebrow mb-2 text-violet-glow">Şimdinin ayrıcalığı</div>
              <p className="text-[0.9rem] leading-relaxed text-chalk/78">
                Blok evrende "şimdi", "burada" gibidir: konuşanın konumunu belirtir, evrenin
                bir özelliğini değil. Sen dünya çizgin boyunca her noktada "şimdi buradayım"
                dersin — hepsi eşit derecede doğrudur.
              </p>
            </div>
            <div className="card p-4">
              <div className="eyebrow mb-2 text-amber-glow">Peki değişim?</div>
              <p className="text-[0.9rem] leading-relaxed text-chalk/78">
                Eternalist yanıt: değişim, farklı zamanlarda farklı özelliklere sahip olmaktır —
                tıpkı bir sopanın farklı yerlerinde farklı kalınlıkta olması gibi. Değişim için
                bloğun kendisinin değişmesi gerekmez.
              </p>
            </div>
          </div>
        </Section>

        {/* 08 ------------------------------------------------------------ */}
        <Section
          id="irade"
          eyebrow="08 · Argüman ve itirazlar"
          title="Gelecek zaten oradaysa, seçimlerim ne oluyor?"
          lead={
            <>
              Blok evren fikrinin en çok yanlış anlaşılan yanı burası. Argümanı olduğu gibi
              kuralım, sonra ona verilen en güçlü cevapları yan yana koyalım. Bu tartışma
              kapanmadı — kapanmış gibi anlatan herkesten şüphelen.
            </>
          }
        >
          <ArgumentChain />
          <div className="mt-8">
            <Callout kind="insight" title="Kaderci okumaya karşı kısa bir not">
              "Yarın ne yapacağım blokta zaten yazılı" cümlesi doğru olabilir. Ama orada yazılı
              olmasının <em className="not-italic text-chalk">nedeni</em> senin yarın öyle
              seçecek olmandır — tersi değil. Blok, kararlarının kaydıdır; onları dışarıdan
              dayatan bir senaryo değil. Seçim yapmayı bırakırsan blok da başka türlü olurdu.
            </Callout>
          </div>
        </Section>

        {/* 09 ------------------------------------------------------------ */}
        <Section
          id="kaynaklar"
          eyebrow="09 · Devamı"
          title="Kaynaklar ve daha derine inmek için"
          lead="Bu sayfadaki her simülasyon gerçek Lorentz dönüşümleriyle hesaplanıyor. Aşağıdaki kaynaklar hem fiziği hem felsefi tartışmayı ilk elden veriyor."
        >
          <ul className="grid gap-3 md:grid-cols-2">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card block h-full p-4 transition-colors hover:border-cyan-glow/45"
                >
                  <div className="font-display text-[0.95rem] font-medium text-chalk">
                    {s.title}
                  </div>
                  <p className="mt-1 text-[0.85rem] leading-relaxed text-mist">{s.note}</p>
                  <span className="mt-2 inline-block font-mono text-[0.7rem] text-cyan-glow">
                    kaynağa git →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <footer className="border-t border-line/70 py-10">
        <div className="shell flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-display text-[0.95rem] font-semibold">Blok Evren</div>
            <p className="mt-1 max-w-md text-[0.82rem] leading-relaxed text-mist">
              Etkileşimli bir özel görelilik ve zaman felsefesi denemesi. Açık kaynak, tarayıcıda
              çalışır, sunucu gerektirmez.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.76rem] text-mist">
            <a
              href="https://github.com/beydah"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cyan-glow"
            >
              github.com/beydah
            </a>
            <span aria-hidden="true">·</span>
            <span>c = 1</span>
          </div>
        </div>
      </footer>
    </>
  )
}
