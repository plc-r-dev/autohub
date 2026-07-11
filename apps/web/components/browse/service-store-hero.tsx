type ServiceStoreHeroProps = {
  name: string;
  rating?: string;
  distance?: string;
  partnerBadge?: string | null;
  openLabel?: string;
  heightClass?: string;
};

function serviceStoreInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AH";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ServiceStoreHero({
  name,
  rating = "4.8",
  distance = "1.2 km",
  openLabel = "Open",
  heightClass = "h-44",
}: ServiceStoreHeroProps) {
  const isOpen = openLabel.toLowerCase() === "open";

  return (
    <div className={`relative ${heightClass} bg-gradient-to-br from-[#18181B] to-[#3F3F46]`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl font-semibold tracking-tight text-white/10">
          {serviceStoreInitials(name)}
        </span>
      </div>
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#18181B]">
          {rating} ★
        </span>
        <span
          className={
            isOpen
              ? "rounded-full bg-[#0F766E] px-2.5 py-1 text-[11px] font-semibold text-white"
              : "rounded-full bg-[#71717A] px-2.5 py-1 text-[11px] font-semibold text-white"
          }
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pt-16 pb-5">
        <p className="text-[12px] text-white/70">{distance}</p>
        <h2 className="mt-0.5 text-[22px] font-semibold tracking-tight text-white">{name}</h2>
      </div>
    </div>
  );
}
