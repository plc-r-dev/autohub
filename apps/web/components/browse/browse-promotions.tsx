const PROMOTIONS = [
  {
    id: "welcome",
    title: "First wash 10% off",
    subtitle: "AutoHub partners near you",
    tone: "from-[#06C755] to-[#04a847]",
  },
  {
    id: "weekend",
    title: "Weekend detailing",
    subtitle: "Book before Sunday",
    tone: "from-[#1a3a4a] to-[#2f6f86]",
  },
] as const;

export function BrowsePromotions() {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[15px] font-semibold text-[#111]">Promotions</h2>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PROMOTIONS.map((promo) => (
          <article
            key={promo.id}
            className={`min-w-[200px] shrink-0 rounded-2xl bg-gradient-to-br ${promo.tone} p-4 text-white shadow-sm`}
          >
            <p className="text-[11px] font-medium text-white/85">Limited time</p>
            <p className="mt-1 text-sm font-semibold">{promo.title}</p>
            <p className="mt-1 text-xs text-white/80">{promo.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
