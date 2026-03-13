import { Locale, messages } from '@/lib/i18n';

export function Hero({ lang, intro, mediaUrl }: { lang: Locale; intro?: string; mediaUrl?: string }) {
  const m = messages[lang];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-700">
      {mediaUrl ? (
        <video className="h-[340px] w-full object-cover" src={mediaUrl} autoPlay muted loop playsInline />
      ) : (
        <div className="h-[340px] w-full bg-[radial-gradient(circle_at_top,_#f4d0c5,_#111827)]" />
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 p-6 text-white">
        <h1 className="text-4xl font-bold">Swing Dance Košice</h1>
        <p className="mt-2 max-w-2xl">{intro}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[m.join, m.firstClass, m.upcoming].map((cta) => <button key={cta} className="rounded-full bg-brand px-4 py-2 text-sm">{cta}</button>)}
        </div>
      </div>
    </section>
  );
}
