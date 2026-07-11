import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { ServiceStoreCard, ServiceStoreStatusBadge } from "@/components/service-store/ui";
import type { ServiceStoreReadiness } from "@/lib/service-store/domain";

export function ServiceStoreReadinessCard({
  readiness,
  showTitle = true,
}: {
  readiness: ServiceStoreReadiness;
  showTitle?: boolean;
}) {
  return (
    <ServiceStoreCard className="space-y-4">
      {showTitle ? (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#15202b]">Readiness checklist</h2>
          <ServiceStoreStatusBadge
            label={readiness.status === "READY" ? "Ready" : "Not ready"}
            status={readiness.status === "READY" ? "ACTIVE" : "DRAFT"}
          />
        </div>
      ) : null}

      <p className="text-sm text-[#5b6b7a]">
        {readiness.metCount} of {readiness.totalCount} requirements complete.
        {readiness.status === "READY"
          ? " Customers can book online."
          : " Complete all items to accept online bookings."}
      </p>

      <ul className="space-y-3">
        {readiness.items.map((item) => (
          <li key={item.id} className="flex gap-3 text-sm">
            {item.met ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#06C755]" />
            ) : (
              <Circle className="mt-0.5 size-5 shrink-0 text-[#b8c5d3]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#15202b]">{item.label}</p>
              <p className="text-[#8a97a5]">{item.description}</p>
              {!item.met && item.actionHref ? (
                <Link
                  href={item.actionHref}
                  className="mt-1 inline-block text-sm font-semibold text-[#0F9B76] hover:underline"
                >
                  Complete this step
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </ServiceStoreCard>
  );
}
