import Link from "next/link";

const ACTIONS = [
  {
    href: "/browse#serviceStores",
    emoji: "🚗",
    label: "Book a Service",
    description: "Find a car wash near you",
  },
  {
    href: "/bookings",
    emoji: "📅",
    label: "My Bookings",
    description: "Upcoming appointments",
  },
  {
    href: "/profile#vehicles",
    emoji: "🚘",
    label: "My Vehicles",
    description: "Saved license plates",
  },
  {
    href: "/profile#support",
    emoji: "💬",
    label: "Contact AutoHub",
    description: "Chat with support",
  },
] as const;

export function LiffHomeActions() {
  return (
    <section className="grid grid-cols-2 gap-2.5">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex min-h-[88px] flex-col justify-between rounded-2xl border border-[#e5e8eb] bg-white p-3.5 active:bg-[#f0f2f5]"
        >
          <span className="text-2xl leading-none" aria-hidden>
            {action.emoji}
          </span>
          <div>
            <p className="text-sm font-semibold text-[#111]">{action.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-[#6b7c8c]">
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}
