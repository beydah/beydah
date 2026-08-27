import { useMemo, useState } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { ONTOLOGY_META, OntologyScene, type Ontology } from '../three/OntologyScene'
import { PillButton, SegmentedControl } from '../ui'
import { useThemePalette } from '../../lib/theme'

/**
 * Üç görüşün karşılaştırması ve küçük bir yoklama.
 *
 * Yoklamanın amacı kimseyi bir yere yerleştirmek değil; okurun kendi
 * sezgisinin farkına varması. Çoğu insan üç soruya üç farklı görüşün
 * cevabını verir — ve tartışmanın neden bitmediği o zaman anlaşılır.
 */

const CARDS: Record<Ontology, { claim: string; strength: string; problem: string }> = {
  presentism: {
    claim:
      'Var olan tek şey şu an. Dedenin çocukluğu artık hiçbir yerde değil; yarınki kahven de henüz hiçbir yerde değil.',
    strength:
      'Yaşadığımız şeye en yakın cevap bu. Zamanın aktığını, geçmişin gittiğini, geleceğin açık olduğunu doğrudan söyler.',
    problem:
      'Görelilik ortak bir “şu an” tanımıyor. Hangi dilimin gerçek olduğunu söyleyebilmek için evrende ayrıcalıklı bir gözlemci gerekir — fizik böyle birini bulamıyor.',
  },
  growing: {
    claim:
      'Olan oldu ve kaldı; olacak olan henüz yok. Evren her an bir dilim daha ekleyerek büyüyor, geçmiş birikiyor.',
    strength:
      'Geçmişin geri alınamazlığını da geleceğin açıklığını da korur. Ahlaki sezgilerimize en rahat oturan görüş.',
    problem:
      'Blok tam olarak nerede bitiyor? Eşzamanlılık göreliyse “büyüme cephesi” herkes için farklı yerde olur. Üstelik “ben en son dilimdeyim” dediğinde, geçmişteki her sen de aynı şeyi diyordu.',
  },
  eternalism: {
    claim:
      'Geçmiş, şimdi ve gelecek eşit derecede var. “Şimdi”, tıpkı “burası” gibi, konuşanın nerede durduğunu söyler — evrenin bir özelliğini değil.',
    strength:
      'Görelilikle sürtüşmesiz uyuşur. Kimsenin dilimi ayrıcalıklı değildir, çünkü ayrıcalıklı bir dilim gerekmez.',
    problem:
      'Öyleyse bu akış hissi ne? Değişim gerçekse blokta neye karşılık geliyor? Eternalizm bu soruyu cevaplamak zorunda ve cevabı herkesi ikna etmiyor.',
  },
}

const QUIZ: { q: string; options: { text: string; lean: Ontology }[] }[] = [
  {
    q: 'Yarın sabah içeceğin kahve şu an nerede?',
    options: [
      { text: 'Hiçbir yerde. Henüz yok.', lean: 'presentism' },
      { text: 'Henüz yok, ama yolda.', lean: 'growing' },
      { text: 'Yarın sabahta. Sen henüz oraya varmadın.', lean: 'eternalism' },
    ],
  },
  {
    q: 'Çocukluğunun geçtiği o yaz…',
    options: [
      { text: 'Bitti. Geriye yalnızca hatıra kaldı.', lean: 'presentism' },
      { text: 'Olmuş bir şey olarak hep gerçek kalacak.', lean: 'growing' },
      { text: 'Şu an kadar gerçek — sadece başka bir zamanda.', lean: 'eternalism' },
    ],
  },
  {
    q: 'Birazdan vereceğin kararın sonucu…',
    options: [
      { text: 'Sen seçene kadar hiçbir yerde yazılı değil.', lean: 'presentism' },
      { text: 'Henüz yazılmadı. Yazacak olan sensin.', lean: 'growing' },
      { text: 'Yazılı. Ama yazan yine sensin.', lean: 'eternalism' },
    ],
  },
]

export function OntologyExplorer() {
  const pal = useThemePalette()
  const [focus, setFocus] = useState<Ontology>('eternalism')
  const [playing, setPlaying] = useState(true)
  const [answers, setAnswers] = useState<(Ontology | null)[]>([null, null, null])

  const card = CARDS[focus]
  const meta = ONTOLOGY_META[focus]

  const tally = useMemo(() => {
    const counts: Record<Ontology, number> = { presentism: 0, growing: 0, eternalism: 0 }
    answers.forEach((a) => {
      if (a) counts[a] += 1
    })
    const answered = answers.filter(Boolean).length
    if (answered < QUIZ.length) return null
    const top = (Object.entries(counts) as [Ontology, number][]).sort((a, b) => b[1] - a[1])
    const mixed = top[0][1] === top[1][1]
    return { counts, leader: top[0][0], mixed }
  }, [answers])

  return (
    <div className="flex flex-col gap-5">
      <SceneFrame
        label="Üç zaman görüşünün karşılaştırması: yalnızca şimdi, büyüyen geçmiş, hepsi."
        camera={[0, 2.4, 13]}
        fov={42}
        heightClass="h-[38vh] min-h-[240px] max-h-[400px] md:h-[46vh]"
      >
        <OntologyScene focus={focus} playing={playing} />
      </SceneFrame>

      <div className="grid gap-3 md:grid-cols-[1.4fr_auto] md:items-end">
        <SegmentedControl
          label="Hangi görüşü öne çıkaralım?"
          value={focus}
          onChange={setFocus}
          options={[
            { value: 'presentism', label: 'Yalnızca şimdi' },
            { value: 'growing', label: 'Büyüyen geçmiş' },
            { value: 'eternalism', label: 'Hepsi' },
          ]}
        />
        <div>
          <PillButton active={playing} onClick={() => setPlaying((v) => !v)}>
            {playing ? 'Zamanı durdur' : 'Zamanı yürüt'}
          </PillButton>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: pal[meta.tone], background: 'transparent' }}
        >
          <div className="eyebrow mb-2" style={{ color: pal[meta.tone] }}>
            ne diyor
          </div>
          <p className="text-[0.95rem] leading-relaxed text-ink">{card.claim}</p>
        </div>
        <div className="card p-4">
          <div className="eyebrow mb-2">en güçlü yanı</div>
          <p className="text-[0.95rem] leading-relaxed text-ink">{card.strength}</p>
        </div>
        <div className="card p-4">
          <div className="eyebrow mb-2">en zayıf yanı</div>
          <p className="text-[0.95rem] leading-relaxed text-ink">{card.problem}</p>
        </div>
      </div>

      {/* --- Küçük yoklama --- */}
      <div className="card p-4 md:p-6">
        <h3 className="font-display text-[1.35rem] text-ink">Sen hangisindesin?</h3>
        <p className="mt-1 mb-5 text-[0.95rem] text-muted">
          Doğru cevabı olan bir test değil bu. Üç soru, üç sezgi — çoğu kişi üçüne üç farklı
          görüşün cevabını verir. Tartışmanın neden bitmediği de biraz bundan.
        </p>

        <div className="space-y-5">
          {QUIZ.map((item, qi) => (
            <fieldset key={item.q}>
              <legend className="mb-2 text-[0.98rem] font-medium text-ink">{item.q}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {item.options.map((opt) => {
                  const selected = answers[qi] === opt.lean
                  return (
                    <button
                      key={opt.text}
                      onClick={() =>
                        setAnswers((prev) => {
                          const next = [...prev]
                          next[qi] = opt.lean
                          return next
                        })
                      }
                      className="rounded-xl border p-3 text-left text-[0.9rem] leading-snug transition-colors"
                      style={{
                        borderColor: selected ? pal[ONTOLOGY_META[opt.lean].tone] : pal.border,
                        background: selected ? pal.surface2 : 'transparent',
                        color: pal.text,
                      }}
                    >
                      {opt.text}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>

        {tally && (
          <div className="mt-5 rounded-xl border border-line bg-surface-2 p-4">
            <p className="text-[1rem] leading-relaxed text-ink">
              {tally.mixed ? (
                <>
                  Cevapların birbirini tutmuyor — ve bu iyi bir işaret. Zamanla ilgili
                  sezgilerimiz tutarlı bir bütün oluşturmuyor; filozofların iki yüzyıldır
                  tartışmasının sebebi de tam olarak bu.
                </>
              ) : (
                <>
                  Sezgin{' '}
                  <span className="font-medium" style={{ color: pal[ONTOLOGY_META[tally.leader].tone] }}>
                    “{ONTOLOGY_META[tally.leader].long}”
                  </span>{' '}
                  tarafında duruyor. Yukarıdaki karta dönüp o görüşün en zayıf yanını bir daha
                  oku — kendi konumunun bedelini bilmek, onu savunmanın ilk şartı.
                </>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <PillButton onClick={() => setFocus(tally.leader)}>
                Bu görüşü blokta göster
              </PillButton>
              <PillButton onClick={() => setAnswers([null, null, null])}>Baştan cevapla</PillButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
