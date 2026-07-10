import Link from "next/link";

export const BROWSE_CATEGORIES = [
  { id: "car-wash", label: "Car Wash", emoji: "🚿" },
  { id: "detailing", label: "Detailing", emoji: "✨" },
  { id: "ceramic", label: "Ceramic", emoji: "🛡️" },
  { id: "oil-change", label: "Oil Change", emoji: "🛢️" },
  { id: "tire", label: "Tire", emoji: "🛞" },
  { id: "battery", label: "Battery", emoji: "🔋" },
] as const;

type BrowseCategoriesProps = {
  activeQuery?: string;
};

export function BrowseCategories({ activeQuery }: BrowseCategoriesProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[#15202b]">Categories</h2>
      <div className="grid grid-cols-3 gap-2.5">
        {BROWSE_CATEGORIES.map((category) => {
          const href = `/browse?q=${encodeURIComponent(category.label)}`;
          const active =
            activeQuery?.trim().toLowerCase() === category.label.toLowerCase();
          return (
            <Link
              key={category.id}
              href={href}
              className={
                active
                  ? "flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl border border-[#06C755]/40 bg-[#e9fbef] px-2 py-3 text-center shadow-sm"
                  : "flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl border border-[#dce5ee] bg-white px-2 py-3 text-center shadow-sm"
              }
            >
              <span className="text-xl" aria-hidden>
                {category.emoji}
              </span>
              <span className="text-[11px] font-medium text-[#15202b]">
                {category.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
