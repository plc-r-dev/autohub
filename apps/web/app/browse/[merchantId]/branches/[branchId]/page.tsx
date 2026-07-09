import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, customerNav } from "@/components/layout/page-shell";
import { formatPrice } from "@/lib/booking/format";
import { getBrowseBranch } from "@/lib/booking/discovery-queries";

type PageProps = {
  params: Promise<{ merchantId: string; branchId: string }>;
};

export default async function BrowseBranchPage({ params }: PageProps) {
  const { merchantId, branchId } = await params;

  const branch = await getBrowseBranch(merchantId, branchId);

  if (!branch) {
    notFound();
  }

  return (
    <PageShell
      title={branch.name}
      description={`${branch.merchant.name} · ${branch.code}`}
      nav={customerNav}
      backHref={`/browse/${merchantId}`}
    >
      {branch.address ? <p className="text-sm">{branch.address}</p> : null}

      {branch.services.length === 0 ? (
        <p className="text-muted-foreground text-sm">No active services.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {branch.services.map((service) => (
            <article
              key={service.id}
              className="border-input flex items-start justify-between gap-4 rounded-md border p-4"
            >
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-muted-foreground text-sm">
                  {service.code} · {service.duration} min + {service.bufferMinutes}{" "}
                  min buffer · {formatPrice(service.price)}
                </p>
              </div>
              <Link
                href={`/bookings/new?branchId=${branch.id}&serviceId=${service.id}`}
                className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-8 items-center rounded-4xl px-3 text-sm font-medium"
              >
                Book
              </Link>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
