import { useState } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { LightConeScene } from '../three/LightConeScene'
import { Callout, Panel, PillButton, Slider, Stat } from '../ui'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { causalRelation, formatTR, intervalSquared } from '../../lib/relativity'

/**
 * Işık konisi gezgini.
 *
 * Deneme olayını gezdirdikçe aralık işareti değişir ve olay üç bölgeden
 * birine düşer. Metin, geometriyi gündelik dile çevirir: yetişebilir misin,
 * yetişemez misin.
 */

const PRESETS = [
  { label: 'Bu akşam, aynı evde', t: 2.6, r: 0.05 },
  { label: 'Dün, aynı evde', t: -2.4, r: 0.05 },
  { label: 'Şu an, çok uzakta', t: 0, r: 3.2 },
  { label: 'Işık tam yetişir', t: 2.4, r: 2.4 },
]

const TEXT: Record<string, { title: string; body: string; kind: 'insight' | 'objection' }> = {
  future: {
    title: 'Buraya yetişebilirsin',
    body: 'Bir mesaj, bir mektup, bir tren bileti — ya da sadece bekleyerek. Bu olay senin geleceğinde ve ona bir şey yapabilirsin. Bu yüzden hiçbir gözlemci onun senden önce olduğunu göremez: nedensellik herkes için aynı yönde işler.',
    kind: 'insight',
  },
  past: {
    title: 'Bu sana çoktan ulaşmış olabilir',
    body: 'Bu olay senin geçmişinde. Belki haberini aldın, belki almadın — ama seni etkilemiş olması mümkün. Bu sıralama da tartışmaya kapalı: kimse bunu senin geleceğinde göremez.',
    kind: 'insight',
  },
  elsewhere: {
    title: 'Ne sen ona, ne o sana',
    body: 'Işık bile aranızda gidip gelmeye yetmiyor. Ona hiçbir şey gönderemezsin, ondan hiçbir haber alamazsın. Ve tam da bu yüzden, o olayın senin şimdinden önce mi sonra mı olduğu gözlemciye göre değişir. Bütün tartışma bu boşlukta geçiyor.',
    kind: 'objection',
  },
  lightlike: {
    title: 'Tam ışık hızında',
    body: 'Koninin yüzeyindesin: yalnızca ışığın kendisi bu iki olayı birbirine bağlayabilir. Gece gökyüzüne baktığında gördüğün her şey seninle tam bu ilişkidedir.',
    kind: 'insight',
  },
}

export function LightConeExplorer() {
  const [probeT, setProbeT] = useState(2.6)
  const [probeR, setProbeR] = useState(0.05)
  const narrow = useIsNarrow()

  const relation = causalRelation({ t: 0, x: 0 }, { t: probeT, x: probeR }, 0.06)
  const s2 = intervalSquared({ t: 0, x: 0 }, { t: probeT, x: probeR })
  const info = TEXT[relation]

  // Olaya yetişmek için gereken hız (ışık hızının katı olarak)
  const needed = probeT !== 0 ? Math.abs(probeR / probeT) : Infinity

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="min-w-0">
        <SceneFrame
          label="Işık konisi: yukarısı ulaşabildiğin her şey, aşağısı sana ulaşmış olabilecek her şey, yanları erişilemez bölge."
          camera={narrow ? [9.5, 4.2, 11] : [7.5, 3.2, 8.5]}
          heightClass="h-[50vh] min-h-[300px] max-h-[520px] md:h-[58vh]"
        >
          <LightConeScene probeT={probeT} probeR={probeR} />
        </SceneFrame>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Bir olay seç">
          <div className="mb-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <PillButton
                key={p.label}
                active={Math.abs(probeT - p.t) < 0.03 && Math.abs(probeR - p.r) < 0.03}
                onClick={() => {
                  setProbeT(p.t)
                  setProbeR(p.r)
                }}
              >
                {p.label}
              </PillButton>
            ))}
          </div>
          <Slider
            label="Ne kadar sonra (ya da önce)?"
            value={probeT}
            display={`${formatTR(probeT, 1)} saniye`}
            min={-3.6}
            max={3.6}
            step={0.05}
            onChange={setProbeT}
          />
          <div className="mt-2">
            <Slider
              label="Ne kadar uzakta?"
              hint="1 ışık-saniyesi ≈ 300.000 km — Dünya’nın çevresinin yedi buçuk katı."
              value={probeR}
              display={`${formatTR(probeR, 2)} ışık-sn`}
              min={0}
              max={4.6}
              step={0.05}
              onChange={setProbeR}
            />
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="Yetişmek için gereken hız"
            value={needed === Infinity ? 'sonsuz' : formatTR(needed, 2)}
            unit={needed === Infinity ? '' : '× ışık'}
            tone={needed > 1 ? 'clay' : 'mint'}
          />
          <Stat
            label="Uzayzaman aralığı"
            value={formatTR(s2, 2)}
            tone={s2 > 0 ? 'clay' : 'mint'}
          />
        </div>

        <Callout kind={info.kind} title={info.title}>
          {info.body}
        </Callout>
      </div>
    </div>
  )
}
