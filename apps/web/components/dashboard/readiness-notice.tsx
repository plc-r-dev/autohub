import Link from "next/link";
import { ServiceStoreReadinessCard } from "@/components/service-store/service-store-readiness-card";
import type { ServiceStoreReadiness } from "@/lib/service-store/domain";

type ReadinessNoticeProps = {
  readiness: ServiceStoreReadiness | null;
};

/** Renders the readiness checklist only while the store isn't fully ready -- otherwise renders nothing. */
export function ReadinessNotice({ readiness }: ReadinessNoticeProps) {
  if (!readiness || readiness.status === "READY") {
    return null;
  }

  return (
    <div className="space-y-3">
      <ServiceStoreReadinessCard readiness={readiness} />
      <p className="text-sm text-muted-foreground">
        <Link href="/app/readiness" className="font-semibold text-primary hover:underline">
          View full readiness checklist
        </Link>
      </p>
    </div>
  );
}
