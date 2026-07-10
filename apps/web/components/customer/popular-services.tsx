import Link from "next/link";

const SERVICES = [
  { label: "Car wash", query: "wash" },
  { label: "Detailing", query: "detail" },
  { label: "Coating", query: "coat" },
  { label: "Interior", query: "interior" },
  { label: "Maintenance", query: "maintenance" },
] as const;

export function PopularServices() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[22px] font-semibold tracking-tight text-[#0A0A0A] md:text-[24px]">
        Popular services
      </h2>
      <div className="flex flex-wrap gap-2">
        {SERVICES.map((service) => (
          <Link
            key={service.query}
            href={`/browse?q=${encodeURIComponent(service.query)}`}
            className="rounded-full border border-[#E2E8F0] bg-white px-5 py-2.5 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:border-[#0F9B76]/30 hover:bg-[#ECFDF5] hover:text-[#0F9B76]"
          >
            {service.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
