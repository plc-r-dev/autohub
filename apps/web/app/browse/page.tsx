import Link from "next/link";
import { redirect } from "next/navigation";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, customerNav } from "@/components/layout/page-shell";
import { listBrowseMerchantsPaginated } from "@/lib/booking/discovery-queries";
import { requireDomainUser } from "@/lib/auth/domain-user";
import {
  getMerchantAccessState,
  isMerchantUser,
} from "@/lib/merchant/access";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; pageSize?: string }>;
};

export default async function BrowsePage({ searchParams }: PageProps) {
  const { user } = await requireDomainUser();
  const params = await searchParams;
  const merchantAccess = await getMerchantAccessState(user.id);

  if (isMerchantUser(merchantAccess)) {
    redirect("/merchant/dashboard");
  }

  const { page, pageSize } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const { totalCount, rows } = await listBrowseMerchantsPaginated({
    q: params.q,
    page,
    pageSize,
    sort,
  });

  return (
    <PageShell
      title="Browse merchants"
      description="Discover active automotive service providers across AutoHub."
      nav={customerNav}
      backHref="/dashboard"
    >
      <ListToolbar searchPlaceholder="Search merchant or code" />
      <ListTable
        rows={rows}
        getRowKey={(merchant) => merchant.id}
        emptyLabel="No merchants with bookable services are available right now."
        hasFilters={Boolean(params.q)}
        columns={[
          {
            key: "merchant",
            header: "Merchant",
            render: (merchant) => (
              <Link href={`/browse/${merchant.id}`} className="font-medium underline-offset-2 hover:underline">
                {merchant.name}
              </Link>
            ),
          },
          { key: "code", header: "Code", render: (merchant) => merchant.code },
          { key: "tenant", header: "Tenant", render: (merchant) => merchant.tenant.name },
          {
            key: "branches",
            header: "Bookable branches",
            render: (merchant) => merchant._count.branches,
          },
          {
            key: "description",
            header: "Description",
            render: (merchant) => merchant.description ?? "-",
          },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={params} />
    </PageShell>
  );
}
