import { CalendarClock, ClipboardList, TrendingUp, Users } from "lucide-react";
import { MarketingSection, MarketingSectionHeading } from "@/components/marketing/section-container";

const SCHEDULE = [
  { time: "09:00", service: "Basic Wash", vehicle: "Toyota Yaris" },
  { time: "10:30", service: "Interior Detail", vehicle: "Honda City" },
  { time: "13:00", service: "Premium Wash", vehicle: "Mazda 2" },
];

const BOOKINGS = [
  { id: "AH-260711-000042", service: "Premium Wash", status: "Confirmed" },
  { id: "AH-260711-000041", service: "Basic Wash", status: "In Progress" },
  { id: "AH-260711-000039", service: "Interior Detail", status: "Completed" },
];

const CUSTOMERS = [
  { initials: "SP", name: "Somchai P.", visit: "2 days ago" },
  { initials: "NK", name: "Nira K.", visit: "5 days ago" },
  { initials: "TW", name: "Tanawat W.", visit: "1 week ago" },
];

const STATUS_STYLES: Record<string, string> = {
  Confirmed: "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

export function DashboardScreenshot() {
  return (
    <MarketingSection>
      <MarketingSectionHeading
        eyebrow="Service Store Dashboard"
        title="Everything your team needs, at a glance"
      />

      <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <span className="size-3 rounded-full bg-red-300" />
          <span className="size-3 rounded-full bg-amber-300" />
          <span className="size-3 rounded-full bg-emerald-300" />
          <span className="ml-3 text-sm font-medium text-muted-foreground">
            AutoHub — Service Store Dashboard
          </span>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClipboardList className="size-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Today&apos;s Bookings
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">12</p>
          </div>
          <div className="rounded-2xl bg-muted p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="size-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">Revenue</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">฿4,800</p>
          </div>
        </div>

        <div className="grid gap-4 border-t border-border p-6 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="size-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Upcoming Schedule
              </span>
            </div>
            <ul className="space-y-2">
              {SCHEDULE.map((item) => (
                <li key={item.time} className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
                  <p className="font-medium text-foreground">
                    {item.time} · {item.service}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.vehicle}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <ClipboardList className="size-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">Booking List</span>
            </div>
            <ul className="space-y-2">
              {BOOKINGS.map((booking) => (
                <li key={booking.id} className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{booking.service}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{booking.id}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Recent Customers
              </span>
            </div>
            <ul className="space-y-2">
              {CUSTOMERS.map((customer) => (
                <li
                  key={customer.name}
                  className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2 text-sm"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    {customer.initials}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.visit}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
