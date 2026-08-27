import { useState } from 'react'
import { motion } from 'motion/react'
import { SegmentedControl } from './ui'

/**
 * Argüman ve itirazlar yan yana.
 *
 * Amaç bir sonucu dayatmak değil. Zincir sağlam görünüyor; ama her halkasına
 * ciddi bir itiraz var. Okur ikisini birlikte görmeli — tartışmanın kapanmadığı
 * yer tam olarak burası.
 */

const PREMISES = [
  {
    n: '1',
    title: 'Aynı anda olmak, kime sorduğuna bağlı',
    body: 'Bu bir yorum değil, ölçülmüş bir şey. Yeterince uzağa baktığında, iki kişinin “şu anda oluyor” dediği şeyler örtüşmez. Yukarıdaki laboratuvarda kendi elinle gördün.',
  },
  {
    n: '2',
    title: 'Şu an olan bir şey, gerçekten oluyor',
    body: 'Senin şimdinde olan bir olay muğlak, yarı-gerçek, “henüz kesinleşmemiş” bir şey değildir. Olmaktadır. Bu, itiraz etmesi zor bir cümle gibi duruyor.',
  },
  {
    n: '3',
    title: 'Senin yarının, birinin bugünü olabilir',
    body: 'Yeterince uzaktaki bir gözlemcinin şimdisi, senin geleceğinde kalan olayları içerebilir. Sadece yürümeye başlaması bile bunu değiştirir.',
  },
  {
    n: '4',
    title: 'Gerçek olmak pazarlık konusu değil',
    body: 'Bir şey birine göre var, başkasına göre yok olamaz. Uzunluk göreli olabilir, süre göreli olabilir — ama “var olmak” ya vardır ya yoktur.',
  },
  {
    n: '⇒',
    title: 'Öyleyse yarın da var',
    body: 'Senin yarının biri için bugünse ve bugün olan gerçekse, senin yarının da gerçek. Zincir kapandı: gelecek, en az bu an kadar var.',
    conclusion: true,
  },
]

const OBJECTIONS = [
  {
    target: '2 ve 4’e',
    title: 'Belki “gerçek” dediğimiz şey bir dilim değil, bir koni',
    body: 'Howard Stein 1968’de şunu gösterdi: göreliliğe uyan, tutarlı ve gözlemciden bağımsız tek “gerçeklik” ilişkisi, geçmiş ışık konisiyle sınırlı olandır. Yani senin için gerçek olan şey, sana ulaşabilmiş olan şeydir — aynı anda olan şey değil. Bu doğruysa zincir daha ikinci halkada kopuyor.',
  },
  {
    target: '3’e',
    title: 'O gözlemci senin yarını hakkında hiçbir şey bilmiyor',
    body: 'Diliminde senin yarının duruyor olabilir, ama ona bakamaz, ona dokunamaz, ondan haber alamaz. Eşzamanlılık fiziksel bir bağ değil; bir defter tutma tercihi. Bir tercihten “o hâlde yarın var” sonucu çıkarmak fazla ağır bir yük olabilir.',
  },
  {
    target: '4’e',
    title: 'Belki var olmak da göreli olabilir',
    body: 'Uzunluk göreli, süre göreli, eşzamanlılık göreli. Bu listede “var olmak”ın neden mutlak kalması gerektiği hiç açık değil. Bazı filozoflar tam da bunu savunuyor — ve kimse onları henüz çürütebilmiş değil.',
  },
  {
    target: 'sonuca',
    title: 'Blok evren kadercilik değildir',
    body: 'En sık yapılan hata bu. “Yarın ne yapacağım zaten yazılı” cümlesi doğru olsa bile, oradaki yazının kalemi senin elinde. Blok senin kararlarının kaydıdır, onların yerine geçen bir senaryo değil. Farklı seçseydin blok da farklı olurdu — ve “farklı seçebilir miydim” sorusu blok evrenle değil, bambaşka bir tartışmayla ilgili.',
  },
]

export function ArgumentChain() {
  const [view, setView] = useState<'premises' | 'objections'>('premises')

  return (
    <div>
      <div className="mb-6 lg:hidden">
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: 'premises', label: 'Argüman' },
            { value: 'objections', label: 'İtirazlar' },
          ]}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className={view === 'premises' ? '' : 'hidden lg:block'}>
          <h3 className="eyebrow mb-5 text-mint">Zincir</h3>
          <ol className="relative space-y-3">
            <span
              aria-hidden="true"
              className="absolute top-3 bottom-8 left-[15px] w-px bg-line"
            />
            {PREMISES.map((p, i) => (
              <motion.li
                key={p.n}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative flex gap-3.5"
              >
                <span
                  className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-[0.78rem] ${
                    p.conclusion
                      ? 'border-mint bg-mint text-bg'
                      : 'border-line-strong bg-bg text-muted'
                  }`}
                >
                  {p.n}
                </span>
                <div className={`card flex-1 p-4 ${p.conclusion ? 'border-mint' : ''}`}>
                  <div
                    className={`text-[1rem] font-semibold ${p.conclusion ? 'text-mint' : 'text-ink'}`}
                  >
                    {p.title}
                  </div>
                  <p className="mt-1.5 text-[0.93rem] leading-relaxed text-muted">{p.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className={view === 'objections' ? '' : 'hidden lg:block'}>
          <h3 className="eyebrow mb-5 text-clay">Ciddiye alınması gerekenler</h3>
          <div className="space-y-3">
            {OBJECTIONS.map((o, i) => (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card border-l-2 border-l-clay p-4"
              >
                <div className="mb-1.5 font-mono text-[0.7rem] tracking-wide text-clay">
                  {o.target}
                </div>
                <div className="text-[1rem] font-semibold text-ink">{o.title}</div>
                <p className="mt-1.5 text-[0.93rem] leading-relaxed text-muted">{o.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
