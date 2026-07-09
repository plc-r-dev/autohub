import Link from "next/link";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { requireApprovedMerchantUser } from "@/lib/auth/domain-user";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; pageSize?: string }>;
};

export default async function MerchantBranchesPage({ searchParams }: PageProps) {
  const { merchant } = await requireApprovedMerchantUser();
  const params = await searchParams;
  const { page, pageSize, skip } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const keyword = params.q?.trim();

  const where = {
    merchantId: merchant.id,
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
      nav={merchantNav}
      backHref="/merchant/dashboard"
    >
      <div className="flex justify-end">
        <Link
          href="/merchant/branches/new"
          className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-9 items-center rounded-4xl px-3 text-sm font-medium"
        >
          Add branch
        </Link>
      </div>

      <ListToolbar searchPlaceholder="Search branch name, code, address" />
      <ListTable
        rows={rows}
        getRowKey={(branch) => branch.id}
        emptyLabel="No branches yet."
        hasFilters={Boolean(params.q)}
        columns={[
          { key: "name", header: "Branch", render: (branch) => branch.name },
          { key: "code", header: "Code", render: (branch) => branch.code },
          { key: "address", header: "Address", render: (branch) => branch.address ?? "-" },
          { key: "services", header: "Services", render: (branch) => branch._count.services },
          {
            key: "actions",
            header: "Actions",
            render: (branch) => (
              <div className="flex gap-3">
                <Link href={`/merchant/branches/${branch.id}`} className="underline-offset-2 hover:underline">Edit</Link>
                <Link href={`/merchant/branches/${branch.id}/hours`} className="underline-offset-2 hover:underline">Hours</Link>
                <Link href={`/merchant/branches/${branch.id}/services`} className="underline-offset-2 hover:underline">Services</Link>
              </div>
            ),
          },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={params} />
    </PageShell>
  );
}
