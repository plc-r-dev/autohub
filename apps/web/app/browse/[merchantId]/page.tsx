import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, customerNav } from "@/components/layout/page-shell";
import { getBrowseMerchant } from "@/lib/booking/discovery-queries";

type PageProps = {
  params: Promise<{ merchantId: string }>;
};

export default async function BrowseMerchantPage({ params }: PageProps) {
  const { merchantId } = await params;

  const merchant = await getBrowseMerchant(merchantId);

  if (!merchant) {
    notFound();
  }

  return (
    <PageShell
      title={merchant.name}
      description={`${merchant.tenant.name} · ${merchant.description ?? merchant.code}`}
      nav={customerNav}
      backHref="/browse"
    >
      {merchant.branches.length === 0 ? (
        <p className="text-muted-foreground text-sm">No bookable branches available.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {merchant.branches.map((branch) => (
            <Link
              key={branch.id}
              href={`/browse/${merchant.id}/branches/${branch.id}`}
              className="border-input hover:bg-muted rounded-md border p-4"
            >
              <p className="font-medium">{branch.name}</p>
              <p className="text-muted-foreground text-sm">
                {branch.code} · {branch.services.length} active services
              </p>
              {branch.address ? (
                <p className="mt-1 text-sm">{branch.address}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
