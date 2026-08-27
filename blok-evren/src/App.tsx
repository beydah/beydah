import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { ArgumentChain } from './components/ArgumentChain'
import { Callout, Prose, PullQuote, Section } from './components/ui'
import { BlockExplorer } from './components/sims/BlockExplorer'
import { MinkowskiLab } from './components/sims/MinkowskiLab'
import { DistanceSim } from './components/sims/DistanceSim'
import { LightConeExplorer } from './components/sims/LightConeExplorer'
import { TwoRoadsSim } from './components/sims/TwoRoadsSim'
import { OntologyExplorer } from './components/sims/OntologyExplorer'
import { EntropyTea } from './components/sims/EntropyTea'

const SOURCES = [
  {
    title: 'Presentism — Stanford Encyclopedia of Philosophy',
    note: 'Üç görüşün ontolojik karşılaştırması, ilk elden.',
    href: 'https://plato.stanford.edu/entries/presentism/',
  },
  {
    title: 'Eternalism — Internet Encyclopedia of Philosophy',
    note: 'Blok evrenin savunusu ve ona yöneltilen temel itirazlar.',
    href: 'https://iep.utm.edu/eternalism/',
  },
  {
    title: 'V. Petkov — Relativity of Simultaneity and Eternalism',
    note: 'Eşzamanlılığın göreliliğinden blok evrene giden argümanın uzun hâli.',
    href: 'https://facultysites.etown.edu/silbermd/files/2011/11/RoSandBlockworld.pdf',
  },
  {
    title: 'Growing block universe — Wikipedia',
    note: 'Büyüyen blok görüşü ve “şu an en son dilimde miyim?” itirazı.',
    href: 'https://en.wikipedia.org/wiki/Growing_block_universe',
  },
  {
    title: 'Eternalism (philosophy of time) — Wikipedia',
    note: 'Rietdijk–Putnam argümanına ve Andromeda örneğine genel bakış.',
    href: 'https://en.wikipedia.org/wiki/Eternalism_(philosophy_of_time)',
  },
  {
    title: 'Roger Penrose — The Emperor’s New Mind (1989)',
    note: 'Kaldırımda yürüyen iki kişi örneğinin ilk anlatıldığı yer.',
    href: 'https://en.wikipedia.org/wiki/The_Emperor%27s_New_Mind',
  },
  {
    title: 'Interactive Minkowski spacetime diagram — Terence Tao',
    note: 'Daha ileri gitmek isteyenler için iki çerçeveli etkileşimli diyagram.',
    href: 'https://teorth.github.io/tao-web/apps/spacetime-diagram.html',
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
          eyebrow="01 · Bir gün"
          title="Bir salı günü, baştan sona"
          divider={false}
          lead={
            <>
              Şu an bir odadasın. Bu sabah başka bir odadaydın, akşam belki bir başkasında
              olacaksın. Sezgimiz bunları sıraya dizer: biri oldu, biri oluyor, biri olacak. Peki
              ya üçü de duruyorsa — ve sıraya dizen sensen?
            </>
          }
        >
          <Prose>
            <p>
              Minkowski 1908’de tuhaf bir cümle kurdu: bundan böyle uzay tek başına ve zaman tek
              başına birer gölgeye dönüşecek, geriye yalnızca ikisinin birleşimi kalacak. Teknik
              bir laf gibi duruyor ama değil. Bizden zamanı, uzayın dördüncü bir yönü gibi
              düşünmemizi istiyordu. Odanın öbür ucu gibi: gitmediğin sürece görmezsin, ama
              gitmemen orayı yok etmez.
            </p>
            <p>
              Aşağıdaki kutu tam olarak bu. Dikey eksen bir günün saatleri — en altta sabah altı,
              en üstte gece on. Yatay eksenler mekân. İçindeki eğriler ise insanlar: sen, annen,
              trende giden bir yabancı. Bir insanın bütün günü, uyanışından uykusuna kadar, tek
              bir çizgi olarak duruyor.
            </p>
            <p>
              Bu resimde hiçbir şey hareket etmiyor, dikkat et. Sen “yaşlanmıyorsun”; çizginin
              farklı noktalarında farklı yaştasın. Annen “telefonu açmıyor”; çizgisinin bir
              yerinde telefonu açmış hâlde duruyor. Hepsi orada. Aynı anda, yan yana, bitmiş.
            </p>
            <p>
              Yeşil düzlem birinin “şimdi”si. Onu eğ — ve asıl olan biteni sağdaki listede izle.
            </p>
          </Prose>

          <div className="mt-8">
            <BlockExplorer />
          </div>

          <PullQuote cite="William Faulkner">
            Geçmiş asla ölmez. Hatta geçmiş bile değildir.
          </PullQuote>
        </Section>

        {/* 02 ------------------------------------------------------------ */}
        <Section
          id="simdi"
          eyebrow="02 · Şimdi"
          title="“Aynı anda” diye bir yer yok"
          lead={
            <>
              Telefonuna gelen mesajla, Tokyo’daki birinin uyanışı aynı anda mı oldu? Soru masum
              görünüyor. Değil — çünkü “aynı anda” dediğin şey, senin ne kadar hızlı gittiğine
              bağlı olarak değişiyor.
            </>
          }
        >
          <Prose>
            <p>
              Newton’un evreninde her yere asılmış tek bir duvar saati vardı. Ne yaparsan yap, o
              saat herkes için aynı anı gösteriyordu; “şu an” evrenin bir özelliğiydi. Einstein o
              saati duvardan indirdi. Yerine tek bir kural koydu: ışık hızı, kim ölçerse ölçsün
              aynı çıkar. Bunu kabul ettiğin anda, “aynı anda olmak” kişiye göre değişen bir şeye
              dönüşüyor.
            </p>
            <p>
              Aşağıdaki laboratuvarda dört sıradan olay var. Bir alarm, uzaktaki bir uyanış, bir
              mesajın gönderilişi ve okunuşu. Olayları yerinde bırak, sadece kendi hızını
              değiştir. Bazılarının sırası dönecek.
            </p>
            <p>
              Ama hepsinin değil. Ve fark eden bu: <span className="accent">aralarında bir
              sinyalin gidebildiği</span> olayların sırası hiçbir hızda dönmüyor. Mesajı önce
              gönderip sonra okuyorsun — evrende bunun tersini gören kimse yok. Görelilik zamanın
              sırasını yalnızca kimsenin bakamayacağı yerlerde bulanıklaştırıyor.
            </p>
          </Prose>

          <div className="mt-8">
            <MinkowskiLab />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Callout kind="insight" title="Nedensellik neden zarar görmüyor?">
              Bir olay diğerinin sebebi olabiliyorsa, aralarındaki zaman farkı mesafelerinden
              büyüktür — yani ışık yetişir. Bu durumda hiçbir hız sıralamayı ters çeviremez.
              Evren, ters çevrilmesi bir şeyi bozacak olan sıralamaları koruyor; gerisini
              serbest bırakıyor.
            </Callout>
            <Callout kind="objection" title="Peki bu neden rahatsız edici?">
              Çünkü “şu anda olan her şey” dediğin küme, senin yürüyüş yönüne bağlı hâle geliyor.
              İki kişi aynı kaldırımda, zıt yönlerde yürürken bile aynı kümeyi paylaşmıyor.
              Öyleyse hangisinin kümesi gerçekten “şu an”?
            </Callout>
          </div>
        </Section>

        {/* 03 ------------------------------------------------------------ */}
        <Section
          id="mesafe"
          eyebrow="03 · Mesafe"
          title="Şimdi ne kadar uzağa uzanır?"
          lead={
            <>
              Kaldırımda yürümeye başladığın an, karşı koltuktaki arkadaşının “şimdi”si seninkinden
              kayar. Kayma otuz attosaniye kadar — yani hiç. Şimdi aynı adımı, aynı formülü, daha
              uzağa uygula.
            </>
          }
        >
          <Prose>
            <p>
              Bu bölümdeki tek formül şu: Δt = β · d / c. Türkçesi, kaymanın büyüklüğü hızınla
              mesafenin çarpımına bağlı. Yürüme hızı gülünecek kadar küçük bir sayı — ışık hızının
              milyarda beşi. Ama çarpımda ikinci bir terim daha var ve onun sınırı yok.
            </p>
            <p>
              Listeden başlarken karşı koltuğu seç, sonra sokağın sonunu, sonra Ankara’yı. Sayı
              attosaniyeden femtosaniyeye, oradan pikosaniyeye çıkıyor. Hâlâ hiçbir şey. Sonra Ay,
              sonra en yakın yıldız. Ve sonunda Andromeda: aynı yürüyüş, aynı formül, aradaki fark{' '}
              <span className="accent">günler</span>.
            </p>
            <p>
              Penrose bu örneği 1989’da anlattı ve şu sonuca dikkat çekti: iki kişi yan yana
              yürürken, birinin şimdisinde uzaktaki bir olay çoktan olmuş, ötekinin şimdisinde
              daha karar bile alınmamış olabilir. Kimse kimseye sinyal gönderemiyor, kimse bunu
              göremiyor. Ama soru duruyor: bu iki “şimdi”den hangisi gerçekten şimdi?
            </p>
          </Prose>

          <div className="mt-8">
            <DistanceSim />
          </div>

          <PullQuote>
            Kayma her zaman vardı. Sadece bizim boyumuzda görünmüyordu.
          </PullQuote>
        </Section>

        {/* 04 ------------------------------------------------------------ */}
        <Section
          id="dokunmak"
          eyebrow="04 · Erişim"
          title="Kime ulaşabilirsin?"
          lead={
            <>
              Şu an bir mesaj yazsan kime yetişir? Soru pratik geliyor ama cevabı bir geometri —
              ve o geometri, nelerin senin için “gerçek” sayılabileceğini de belirliyor olabilir.
            </>
          }
        >
          <Prose>
            <p>
              Her an, iki koninin tepesinde oturuyorsun. Yukarıdaki koni bir şey
              gönderebileceğin her yer ve her an: bir mesaj, bir mektup, kendin. Aşağıdaki koni
              sana bir şey ulaşmış olabilecek her yer ve her an. Aradaki geniş boşluk ise — hemen
              yanı başında olup bitenler dahil — o an ne ulaşabildiğin ne de haber alabildiğin
              her şey.
            </p>
            <p>
              Bu boşluk sandığından geniş. Şu an Tokyo’da olan bir şey senin için erişilemez;
              oradan gelecek en hızlı haber bile yolda. “Şu anda Tokyo’da olan şey” cümlesi,
              fizik açısından, hiçbir zaman doğrudan doğrulayabileceğin bir şey değil.
            </p>
          </Prose>

          <div className="mt-8">
            <LightConeExplorer />
          </div>

          <div className="mt-6">
            <Callout kind="insight" title="Belki de “gerçek” olan, dilim değil koni">
              Bu bölümdeki geometri, sonraki tartışmanın en güçlü itirazını taşıyor. Eğer senin
              için gerçek olan şey “seninle aynı anda olan” değil de{' '}
              <span className="accent">“sana ulaşabilmiş olan”</span> ise, blok evrene giden
              argüman daha ilk adımda duruyor. Sekizinci bölümde buna döneceğiz.
            </Callout>
          </div>
        </Section>

        {/* 05 ------------------------------------------------------------ */}
        <Section
          id="yol"
          eyebrow="05 · İki yol"
          title="İki yol, iki ömür"
          lead={
            <>
              Deniz evde kalıyor, Kaya uzun bir yolculuğa çıkıp dönüyor. Buluştuklarında Kaya
              daha genç. Bu bir hile değil, bir uzunluk farkı — ve blok evren fikrini en somut
              gösteren şey.
            </>
          }
        >
          <Prose>
            <p>
              Haritada iki şehir arasında iki yol varsa, biri diğerinden uzun olabilir. Kimse
              buna şaşırmaz. Uzayzamanda da iki olay arasında farklı yollar var ve o yolların
              “süresi” farklı. Kaya’nın yolu Deniz’inkinden kısa; Kaya bu yüzden daha az
              yaşlandı. İkisi de her gününü normal yaşadı, kimsenin saati bozulmadı.
            </p>
            <p>
              Aşağıda kendi yaşını girebilirsin. Sonra pembe kesikli çizgiye dikkat et: o çizgi
              Kaya’nın “şu an Deniz ne yapıyor?” sorusuna verdiği cevap. Dönüş anında o cevap bir
              anda yıllar ileri atlıyor.
            </p>
            <p>
              Ama Deniz’in hayatında o an hiçbir şey olmuyor. Hiçbir yıl kaybolmuyor, hiçbir gün
              atlanmıyor. Değişen tek şey, Kaya’nın bloğu hangi açıyla dilimlediği. Sanki bir
              tepede yürürken dönüp başka yöne bakmışsın gibi: manzara değişir, arazi değişmez.
            </p>
          </Prose>

          <div className="mt-8">
            <TwoRoadsSim />
          </div>
        </Section>

        {/* 06 ------------------------------------------------------------ */}
        <Section
          id="varlik"
          eyebrow="06 · Ne var?"
          title="Fizik şekli veriyor, varlığı vermiyor"
          lead={
            <>
              Buraya kadar olan her şey ölçülmüş, sınanmış, tartışmasız. Şimdi tartışmalı kısma
              geliyoruz: bu geometri, neyin var olduğu hakkında ne söylüyor? Üç ciddi cevap var
              ve üçü de bir bedel ödüyor.
            </>
          }
        >
          <OntologyExplorer />
        </Section>

        {/* 07 ------------------------------------------------------------ */}
        <Section
          id="akis"
          eyebrow="07 · Akış"
          title="Akmıyorsa, bu his ne?"
          lead={
            <>
              Blok evrenin en zor sorusu bu ve dürüst olmak gerekirse kimse tam cevaplayabilmiş
              değil. Blokta hiçbir şey hareket etmiyorsa, neden geçmişi hatırlayıp geleceği
              hatırlamıyoruz? Neden bardak kırılıyor da kendiliğinden birleşmiyor?
            </>
          }
        >
          <Prose>
            <p>
              Cevap beklenmedik bir yerde: yasalarda değil, başlangıç koşulunda. Aşağıdaki bardağa
              bir damla süt düşüyor ve yayılıyor. Şimdi “geri sar”a bas. Süt kendiliğinden
              toplanıp yeniden damla oluyor — ve bu görüntü fiziğe hiç aykırı değil. Her
              damlacık aynı yasalara uyuyor.
            </p>
          </Prose>

          <div className="mt-8">
            <EntropyTea />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <div className="eyebrow mb-2">Hatırlamak</div>
              <p className="text-[0.95rem] leading-relaxed text-ink">
                Bir şeyi hatırlamak, kayıt tutmaktır; kayıt tutmak entropi üretir. Bu yüzden
                hafıza yalnızca tek yöne bakabilir. Blokta nerede durursan dur, “geçmiş” dediğin
                taraf her zaman daha derli toplu olan taraftır.
              </p>
            </div>
            <div className="card p-5">
              <div className="eyebrow mb-2">Şimdinin ayrıcalığı</div>
              <p className="text-[0.95rem] leading-relaxed text-ink">
                “Şimdi”, “burası” gibi olabilir: konuşanın nerede durduğunu söyler, evrenin bir
                özelliğini değil. Sen çizgin boyunca her noktada “şimdi buradayım” diyorsun — ve
                hepsi eşit derecede doğru.
              </p>
            </div>
            <div className="card p-5">
              <div className="eyebrow mb-2">Peki ya değişim?</div>
              <p className="text-[0.95rem] leading-relaxed text-ink">
                Değişim, farklı zamanlarda farklı olmaktır — tıpkı bir sopanın farklı yerlerinde
                farklı kalınlıkta olması gibi. Bunun için bloğun kendisinin değişmesi gerekmiyor.
                İkna edici buluyor musun? Herkes bulmuyor.
              </p>
            </div>
          </div>

          <PullQuote cite="Albert Einstein, 1955">
            Bizim gibi fiziğe inananlar için geçmiş, şimdi ve gelecek arasındaki ayrım yalnızca
            bir yanılsamadır — inatçı bir yanılsama da olsa.
          </PullQuote>
        </Section>

        {/* 08 ------------------------------------------------------------ */}
        <Section
          id="secim"
          eyebrow="08 · Seçim"
          title="Yazılmışsa, seçen kim?"
          lead={
            <>
              Blok evren fikrinin en çok yanlış anlaşılan yeri burası. Argümanı olduğu gibi
              kuralım, sonra ona verilen en güçlü cevapları yanına koyalım. Bu tartışma kapanmadı
              — kapanmış gibi anlatan herkesten şüphelen.
            </>
          }
        >
          <ArgumentChain />

          <div className="mt-10">
            <Callout kind="insight" title="Kısa bir not, kaderci okumaya karşı">
              “Yarın ne yapacağım blokta zaten yazılı” cümlesi doğru olabilir. Ama orada yazılı
              olmasının <span className="accent">sebebi</span>, senin yarın öyle seçecek olmandır
              — tersi değil. Blok, kararlarının kaydı; onların yerine geçen bir senaryo değil.
              Başka türlü seçseydin blok da başka olurdu. Kaderciliğe düşmek için blok evrene
              ihtiyacın yok; ondan kurtulmak için de terk etmene gerek yok.
            </Callout>
          </div>
        </Section>

        {/* 09 ------------------------------------------------------------ */}
        <Section
          id="kaynaklar"
          eyebrow="09 · Devamı"
          title="Buradan sonrası"
          lead="Bu sayfadaki her sayı gerçek Lorentz dönüşümleriyle hesaplandı; hiçbir simülasyonda 'anlaşılsın diye' uydurulmuş bir sabit yok. Daha derine inmek istersen başlangıç noktaları aşağıda."
        >
          <ul className="grid gap-3 md:grid-cols-2">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card block h-full p-4 transition-colors hover:border-mint"
                >
                  <div className="text-[0.98rem] font-medium text-ink">{s.title}</div>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-muted">{s.note}</p>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <footer className="border-t border-line py-10">
        <div className="shell flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-display text-[1.1rem] text-ink">Blok Evren</div>
            <p className="mt-1 max-w-md text-[0.88rem] leading-relaxed text-muted">
              Zaman üzerine etkileşimli bir deneme. Açık kaynak, tarayıcıda çalışır, sunucu
              gerektirmez.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.8rem] text-muted">
            <a
              href="https://github.com/beydah"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-mint"
            >
              github.com/beydah
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
