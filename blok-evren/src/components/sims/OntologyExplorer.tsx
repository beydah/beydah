import { useState } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { ONTOLOGY_META, OntologyScene, type Ontology } from '../three/OntologyScene'
import { PillButton, SegmentedControl } from '../ui'

/**
 * Şimdicilik / büyüyen blok / eternalizm karşılaştırması.
 *
 * Üç blok aynı anda canlandırılır; seçilen görüş öne çıkar. Altındaki kartlar
 * her görüşün ne söylediğini, en güçlü dayanağını ve en can yakıcı itirazını
 * yan yana koyar.
 */

const CARDS: Record<
  Ontology,
  { claim: string; strength: string; problem: string }
> = {
  presentism: {
    claim:
      'Var olan tek şey şu andır. Geçmiş “oldu bitti”, gelecek “henüz yok”. Sezgilerimize en yakın görüş.',
    strength:
      'Ontolojik cimrilik: tek bir dilim yeter. Zamanın akışı ve geçmişin geri gelmezliği doğrudan açıklanır.',
    problem:
      'Görelilikte evrensel bir “şu an” yok. Hangi dilimin gerçek olduğunu söylemek için ayrıcalıklı bir çerçeve seçmek gerekir — fizik böyle bir çerçeve tanımıyor.',
  },
  growing: {
    claim:
      'Geçmiş ve şimdi gerçek, gelecek henüz yazılmadı. Evren her an bir dilim daha ekleyerek büyür.',
    strength:
      'Geçmişin sabitliğini korurken geleceği açık bırakır: özgür irade ve olasılık için yer açar.',
    problem:
      'Blok nerede bitiyor? Eşzamanlılık göreliyse “büyüme cephesi” gözlemciden gözlemciye değişir. Ayrıca “şu an en son dilimdeyim” demeyi neyin garantilediği tartışmalıdır.',
  },
  eternalism: {
    claim:
      'Geçmiş, şimdi ve gelecek eşit derecede gerçektir. 4 boyutlu blok bütün olarak vardır; “şimdi” bir dilimleme açısıdır.',
    strength:
      'Özel görelilikle sürtüşmesiz uyuşur: her gözlemci bloğu kendi açısıyla kesebilir, hiçbiri ayrıcalıklı değildir.',
    problem:
      'Zamanın akışını ve geçmiş–gelecek asimetrisini bir yanılsama saymak zorunda kalır. Değişim gerçekse blokta neye karşılık gelir?',
  },
}

export function OntologyExplorer() {
  const [focus, setFocus] = useState<Ontology>('eternalism')
  const [playing, setPlaying] = useState(true)
  const card = CARDS[focus]
  const meta = ONTOLOGY_META[focus]

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SceneFrame
        label="Üç zaman ontolojisinin karşılaştırması: şimdicilik, büyüyen blok, eternalizm."
        camera={[0, 2.4, 13]}
        fov={42}
        heightClass="h-[42vh] min-h-[260px] max-h-[420px] md:h-[48vh]"
      >
        <OntologyScene focus={focus} playing={playing} />
      </SceneFrame>

      <div className="grid gap-3 md:grid-cols-[1.4fr_auto] md:items-end">
        <SegmentedControl
          label="Hangi görüşü öne çıkaralım?"
          value={focus}
          onChange={setFocus}
          options={[
            { value: 'presentism', label: 'Şimdicilik' },
            { value: 'growing', label: 'Büyüyen Blok' },
            { value: 'eternalism', label: 'Eternalizm' },
          ]}
        />
        <div>
          <PillButton active={playing} onClick={() => setPlaying((v) => !v)}>
            {playing ? '❚❚ Zamanı durdur' : '▶ Zamanı yürüt'}
          </PillButton>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div
          className="card p-4"
          style={{ borderColor: `${meta.color}55`, background: `${meta.color}0d` }}
        >
          <div className="eyebrow mb-2" style={{ color: meta.color }}>
            iddia
          </div>
          <p className="text-[0.92rem] leading-relaxed text-chalk/85">{card.claim}</p>
        </div>
        <div className="card p-4">
          <div className="eyebrow mb-2 text-lime-glow">en güçlü yanı</div>
          <p className="text-[0.92rem] leading-relaxed text-chalk/80">{card.strength}</p>
        </div>
        <div className="card p-4">
          <div className="eyebrow mb-2 text-rose-glow">en zayıf yanı</div>
          <p className="text-[0.92rem] leading-relaxed text-chalk/80">{card.problem}</p>
        </div>
      </div>
    </div>
  )
}
