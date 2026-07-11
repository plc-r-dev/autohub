import Link from "next/link";
import { notFound } from "next/navigation";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { ServiceStoreButtonLink, ServiceStoreStatusBadge } from "@/components/service-store/ui";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { formatPrice } from "@/lib/booking/format";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ branchId: string }>;
  searchParams: Promise<{ q?: string; status?: string; sort?: string; page?: string; pageSize?: string }>;
};

export default async function BranchServicesPage({ params, searchParams }: PageProps) {
  const { branchId } = await params;
  const query = await searchParams;
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const { page, pageSize, skip } = parseListPaging(query);
  const sort = parseSortOrder(query.sort);

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, serviceStoreId: serviceStore.id },
    select: { id: true, name: true },
  });

  if (!branch) {
    notFound();
  }

  const keyword = query.q?.trim();
  const where = {
    branchId: branch.id,
    ...(query.status === "active"
      ? { isActive: true }
      : query.status === "inactive"
        ? { isActive: false }
        : {}),
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" as const } },
            { code: { contains: keyword, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [totalCount, rows] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        duration: true,
        bufferMinutes: true,
        price: true,
        isActive: true,
      },
      orderBy: { name: sort },
      skip,
      take: pageSize,
    }),
  ]);

  return (
    <PageShell
      title={`Services — ${branch.name}`}
      description="Manage services offered at this branch."
      nav={serviceStoreNav}
      backHref={`/service-store/branches/${branch.id}`}
      backLabel="Branch"
      actions={
        <ServiceStoreButtonLink href={`/service-store/branches/${branch.id}/services/new`}>
          Add service
        </ServiceStoreButtonLink>
      }
    >
      <ListToolbar
        searchPlaceholder="Search service name or code"
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
      />
      <ListTable
        rows={rows}
        getRowKey={(service) => service.id}
        emptyLabel="No services yet."
        hasFilters={Boolean(query.q || query.status)}
        columns={[
          { key: "name", header: "Service", render: (service) => service.name },
          { key: "code", header: "Code", render: (service) => service.code },
          { key: "duration", header: "Duration", render: (service) => `${service.duration} min` },
          { key: "buffer", header: "Buffer", render: (service) => `${service.bufferMinutes} min` },
          { key: "price", header: "Price", render: (service) => formatPrice(service.price) },
          {
            key: "status",
            header: "Status",
            render: (service) => (
              <ServiceStoreStatusBadge
                label={service.isActive ? "Active" : "Inactive"}
                status={service.isActive ? "ACTIVE" : "CANCELLED"}
              />
            ),
          },
          {
            key: "action",
            header: "",
            render: (service) => (
              <Link
                href={`/service-store/branches/${branch.id}/services/${service.id}`}
                className="text-sm font-semibold text-[#0F9B76] underline-offset-2 hover:underline"
              >
                Edit
              </Link>
            ),
          },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={query} />
    </PageShell>
  );
}
