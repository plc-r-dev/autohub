import Link from "next/link";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreButtonLink } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; pageSize?: string }>;
};

export default async function ServiceStoreBranchesPage({ searchParams }: PageProps) {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const params = await searchParams;
  const { page, pageSize, skip } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const keyword = params.q?.trim();

  const where = {
    serviceStoreId: serviceStore.id,
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" as const } },
            { code: { contains: keyword, mode: "insensitive" as const } },
            { address: { contains: keyword, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [totalCount, rows] = await Promise.all([
    prisma.branch.count({ where }),
    prisma.branch.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        phone: true,
        address: true,
        _count: { select: { services: true } },
      },
      orderBy: { name: sort },
      skip,
      take: pageSize,
    }),
  ]);

  return (
    <PageShell
      title="Branches"
      description="Manage your business locations."
      nav={serviceStoreNav}
      backHref="/service-store/dashboard"
      actions={<ServiceStoreButtonLink href="/service-store/branches/new">Add branch</ServiceStoreButtonLink>}
    >
      <ListToolbar searchPlaceholder="Search branch name, code, address" />
      <ListTable
        rows={rows}
        getRowKey={(branch) => branch.id}
        emptyLabel="No branches yet."
        hasFilters={Boolean(params.q)}
        columns={[
          { key: "name", header: "Branch", render: (branch) => branch.name },
          { key: "code", header: "Code", render: (branch) => branch.code },
          { key: "address", header: "Address", render: (branch) => branch.address ?? "—" },
          { key: "services", header: "Services", render: (branch) => branch._count.services },
          {
            key: "actions",
            header: "Actions",
            render: (branch) => (
              <div className="flex flex-wrap gap-3 text-sm font-medium">
                <Link href={`/service-store/branches/${branch.id}`} className="text-[#0b7a3a] hover:underline">
                  Edit
                </Link>
                <Link href={`/service-store/branches/${branch.id}/hours`} className="text-[#0b7a3a] hover:underline">
                  Hours
                </Link>
                <Link href={`/service-store/branches/${branch.id}/services`} className="text-[#0b7a3a] hover:underline">
                  Services
                </Link>
              </div>
            ),
          },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={params} />
    </PageShell>
  );
}
