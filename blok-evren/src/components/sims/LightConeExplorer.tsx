import { useState } from 'react'
import { SceneFrame } from '../three/SceneFrame'
import { LightConeScene } from '../three/LightConeScene'
import { Callout, Panel, PillButton, Slider, Stat } from '../ui'
import { useIsNarrow } from '../../hooks/useIsNarrow'
import { causalRelation, formatTR, intervalSquared } from '../../lib/relativity'

/**
 * Işık konisi gezgini.
 *
 * Deneme olayını konide gezdirir; aralık s² = Δx² − Δt² işaretine göre olayın
 * nedensel konumu anında yeniden hesaplanır.
 */

const PRESETS: { label: string; t: number; r: number }[] = [
  { label: 'Yarın, burada', t: 2.4, r: 0.15 },
  { label: 'Şu an, Andromeda', t: 0, r: 3.6 },
  { label: 'Dün, Ay’da', t: -1.9, r: 0.55 },
  { label: 'Tam ışık hızında', t: 2.2, r: 2.2 },
]

const RELATION_TEXT: Record<string, { title: string; body: string; tone: 'cyan' | 'violet' | 'rose' | 'amber' }> = {
  future: {
    title: 'Geleceğindeki bir olay',
    body: 'Bu olaya bir sinyal, bir mektup, bir uzay gemisi gönderebilirsin. Nedensel olarak etkileyebileceğin bölgedesin. Hiçbir gözlemci bu olayın senden önce olduğunu göremez.',
    tone: 'cyan',
  },
  past: {
    title: 'Geçmişindeki bir olay',
    body: 'Bu olay sana ulaşmış olabilir; seni etkilemiş olabilir. Sıralaması tüm gözlemciler için aynıdır — nedensellik korunur.',
    tone: 'violet',
  },
  elsewhere: {
    title: '“Başka yerde” — mutlak olmayan bölge',
    body: 'Ne etkileyebilirsin ne de etkilenebilirsin. Ve işin can alıcı yanı: bu olayın senin şimdinden önce mi sonra mı olduğu gözlemciye göre değişir. Blok evren tartışması tam burada başlar.',
    tone: 'rose',
  },
  lightlike: {
    title: 'Işıksal ayrılmış',
    body: 'Tam ışık hızında bir sinyal ikinizi birleştirebilir — ne daha hızlısı ne daha yavaşı. Koninin yüzeyindesin.',
    tone: 'amber',
  },
}

export function LightConeExplorer() {
  const [probeT, setProbeT] = useState(0.4)
  const [probeR, setProbeR] = useState(2.6)
  const narrow = useIsNarrow()

  const relation = causalRelation({ t: 0, x: 0 }, { t: probeT, x: probeR }, 0.06)
  const s2 = intervalSquared({ t: 0, x: 0 }, { t: probeT, x: probeR })
  const info = RELATION_TEXT[relation]

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div className="min-w-0">
        <SceneFrame
          label="Işık konisi: yukarısı gelecek, aşağısı geçmiş, yanları nedensel bağın olmadığı 'başka yerde' bölgesi."
          camera={narrow ? [9.5, 4.2, 11] : [7.5, 3.2, 8.5]}
          heightClass="h-[54vh] min-h-[300px] max-h-[520px] md:h-[60vh]"
        >
          <LightConeScene probeT={probeT} probeR={probeR} />
        </SceneFrame>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Panel title="Deneme olayını gezdir">
          <Slider
            label="Zaman farkı Δt"
            value={probeT}
            display={formatTR(probeT, 2)}
            min={-3.6}
            max={3.6}
            step={0.02}
            onChange={setProbeT}
          />
          <div className="mt-3">
            <Slider
              label="Uzaklık Δx"
              value={probeR}
              display={formatTR(probeR, 2)}
              min={0}
              max={4.6}
              step={0.02}
              onChange={setProbeR}
              accent="violet"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <PillButton
                key={p.label}
                onClick={() => {
                  setProbeT(p.t)
                  setProbeR(p.r)
                }}
              >
                {p.label}
              </PillButton>
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="Aralık s² = Δx² − Δt²"
            value={formatTR(s2, 2)}
            tone={s2 > 0 ? 'rose' : 'cyan'}
          />
          <Stat
            label="Gereken hız"
            value={probeT !== 0 ? formatTR(Math.abs(probeR / probeT), 2) : '∞'}
            unit="× c"
            tone="amber"
          />
        </div>

        <Callout kind={relation === 'elsewhere' ? 'warning' : 'insight'} title={info.title}>
          {info.body}
        </Callout>
      </div>
    </div>
  )
}
