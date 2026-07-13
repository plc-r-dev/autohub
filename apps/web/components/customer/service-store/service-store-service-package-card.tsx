import Link from "next/link";
import { Clock } from "lucide-react";
import { formatPrice } from "@/lib/booking/format";
import { buildBookingWizardHref } from "@/lib/booking/wizard";
import { cn } from "@workspace/ui/lib/utils";

export type ServicePackage = {
  id: string;
  name: string;
  duration: number;
  price: { toString(): string };
  branchId: string;
  popular?: boolean;
};

type ServiceStoreServicePackageCardProps = {
  service: ServicePackage;
  serviceStoreId: string;
  compact?: boolean;
  showPrice?: boolean;
  canBook?: boolean;
  phone?: string | null;
};

export function ServiceStoreServicePackageCard({
  service,
  serviceStoreId,
  compact = false,
  showPrice = true,
  canBook = true,
  phone,
}: ServiceStoreServicePackageCardProps) {
  const bookHref = buildBookingWizardHref({
    serviceStoreId,
    serviceId: service.id,
    branchId: service.branchId,
  });

  if (compact) {
    return (
      <article className="rounded-[14px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] text-[#0F172A]">
              <span className="font-semibold">{service.name}</span>
              {service.popular ? (
                <span className="ml-2 rounded bg-[#062C21] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                  Popular
                </span>
              ) : null}
              <span className="text-[#64748B]">
                {" "}
                · {service.duration} mins · {formatPrice(service.price)}
              </span>
            </p>
          </div>
          {canBook ? (
            <Link
              href={bookHref}
              className="inline-flex h-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#062C21] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#0A3D2E]"
            >
              Book Now
            </Link>
          ) : phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex h-[36px] shrink-0 items-center justify-center rounded-[10px] border border-[#062C21] px-4 text-[12px] font-semibold text-[#062C21]"
            >
              Call
            </a>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[20px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-[22px] font-semibold tracking-tight text-[#0F172A] md:text-[24px]">
              {service.name}
            </h3>
            {service.popular ? (
              <span className="rounded-md bg-[#062C21] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                Popular
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F5] px-3.5 py-1.5 text-[13px] font-medium text-[#64748B]">
              <Clock className="size-3.5" />
              {service.duration} mins
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-4 sm:items-end lg:text-right">
          {showPrice ? (
            <p className={cn("font-semibold text-[#0F172A]", "text-[22px]")}>
              {formatPrice(service.price)}
            </p>
          ) : null}
          {canBook ? (
            <Link
              href={bookHref}
              className="inline-flex h-[48px] items-center justify-center rounded-[14px] bg-[#062C21] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#0A3D2E] lg:min-w-[140px]"
            >
              Book Now
            </Link>
          ) : phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex h-[48px] items-center justify-center rounded-[14px] border border-[#062C21] px-6 text-[14px] font-semibold text-[#062C21] lg:min-w-[140px]"
            >
              Call
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
