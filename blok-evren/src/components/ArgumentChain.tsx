import { useState } from 'react'
import { motion } from 'motion/react'
import { SegmentedControl } from './ui'

/**
 * Rietdijk–Putnam argümanı ve ona verilen yanıtlar.
 *
 * Sol sütun öncülleri sırayla dizer; sağ sütun her öncüle yöneltilen en ciddi
 * itirazı gösterir. Amaç sonucu dayatmak değil, tartışmanın nerede kırıldığını
 * göstermek.
 */

const PREMISES = [
  {
    n: '1',
    title: 'Özel görelilik doğrudur',
    body: 'Eşzamanlılık mutlak değildir. Hangi olayların "aynı anda" olduğu, gözlemcinin hızına bağlıdır. Bu deneysel olarak defalarca doğrulanmıştır.',
  },
  {
    n: '2',
    title: 'Şimdide olan gerçektir',
    body: 'Bir gözlemcinin "şimdi" dediği dilimdeki olaylar belirli ve gerçektir — henüz olmamış, muğlak şeyler değildir.',
  },
  {
    n: '3',
    title: 'Senin geleceğin, onun şimdisi',
    body: 'Yanından geçen hızlı bir gözlemcinin şimdi dilimi, senin geleceğinde kalan olayları içerebilir. Andromeda paradoksu tam olarak bunu gösterir.',
  },
  {
    n: '4',
    title: 'Gerçeklik gözlemciye göre değişmez',
    body: 'Bir olay birine göre gerçek, diğerine göre gerçek-değil olamaz. "Gerçek olmak" mutlak bir niteliktir.',
  },
  {
    n: '⇒',
    title: 'Sonuç: gelecek de gerçektir',
    body: 'Senin geleceğindeki olay, başka birinin şimdisinde gerçekse ve gerçeklik mutlaksa — o olay şu an da gerçektir. Blok bütündür.',
    conclusion: true,
  },
]

const OBJECTIONS = [
  {
    target: 'Öncül 2 ve 4',
    title: 'Stein’ın teoremi',
    body: 'Howard Stein (1968, 1991) gösterdi ki göreliliğe uyan, gözlemciden bağımsız ve mantıklı tek "gerçeklik" bağıntısı, geçmiş ışık konisiyle sınırlı olandır. Yani "şimdi gerçek olan" kümesi bir dilim değil, bir konidir — ve bu argümanı çökertir.',
  },
  {
    target: 'Öncül 3',
    title: 'Uzaysal ayrılık bilgi taşımaz',
    body: 'Hızlı gözlemcinin diliminde senin geleceğin yer alsa bile, o gözlemci o olay hakkında hiçbir şey bilemez, ona hiçbir etkide bulunamaz. Eşzamanlılık ilişkisi fiziksel bir bağ değil, bir muhasebe seçimidir.',
  },
  {
    target: 'Öncül 4',
    title: 'Gerçeklik çerçeveye göreli olabilir',
    body: 'Uzunluk ve süre çerçeveye göre değişiyorsa, "var olma"nın neden mutlak olması gerektiği açık değildir. Bazı görelilikçi şimdiciler tam da bunu savunur.',
  },
  {
    target: 'Sonuç',
    title: 'Blok evren = kadercilik değildir',
    body: 'Gelecekteki olayın var olması, onun şimdiden hesaplanabilir olduğu anlamına gelmez. Blok, kararlarının sonucudur — kararlarının yerine geçen bir şey değil. Determinizm ile eternalizm ayrı sorulardır.',
  },
]

export function ArgumentChain() {
  const [view, setView] = useState<'premises' | 'objections'>('premises')

  return (
    <div>
      {/* Mobilde sekme, masaüstünde iki sütun */}
      <div className="mb-5 lg:hidden">
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: 'premises', label: 'Argüman' },
            { value: 'objections', label: 'İtirazlar' },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={view === 'premises' ? '' : 'hidden lg:block'}>
          <h3 className="eyebrow mb-4 text-cyan-glow">Rietdijk–Putnam argümanı</h3>
          <ol className="relative space-y-3">
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-6 left-[15px] w-px bg-gradient-to-b from-cyan-glow/45 via-line to-transparent"
            />
            {PREMISES.map((p, i) => (
              <motion.li
                key={p.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative flex gap-3.5"
              >
                <span
                  className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-[0.78rem] ${
                    p.conclusion
                      ? 'border-cyan-glow bg-cyan-glow/20 text-cyan-glow'
                      : 'border-line bg-void text-mist'
                  }`}
                >
                  {p.n}
                </span>
                <div
                  className={`card flex-1 p-3.5 ${
                    p.conclusion ? 'border-cyan-glow/40 bg-cyan-glow/[0.07]' : ''
                  }`}
                >
                  <div
                    className={`font-display text-[0.95rem] font-semibold ${
                      p.conclusion ? 'text-cyan-glow' : 'text-chalk'
                    }`}
                  >
                    {p.title}
                  </div>
                  <p className="mt-1 text-[0.88rem] leading-relaxed text-chalk/75">{p.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className={view === 'objections' ? '' : 'hidden lg:block'}>
          <h3 className="eyebrow mb-4 text-rose-glow">Ciddiye alınması gereken itirazlar</h3>
          <div className="space-y-3">
            {OBJECTIONS.map((o, i) => (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card p-3.5"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-md border border-rose-glow/35 bg-rose-glow/10 px-2 py-0.5 font-mono text-[0.66rem] text-rose-glow">
                    {o.target}
                  </span>
                </div>
                <div className="font-display text-[0.95rem] font-semibold text-chalk">
                  {o.title}
                </div>
                <p className="mt-1 text-[0.88rem] leading-relaxed text-chalk/75">{o.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
