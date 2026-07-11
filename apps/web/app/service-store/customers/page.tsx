import Link from "next/link";
import { ListPagination, ListTable } from "@/components/listing/list-table";
import { ListToolbar } from "@/components/listing/list-toolbar";
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell";
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user";
import { searchServiceStoreCustomersPaginated } from "@/lib/customer/queries";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; pageSize?: string }>;
};

export default async function ServiceStoreCustomersPage({ searchParams }: PageProps) {
  const { serviceStore } = await requireApprovedServiceStoreUser();
  const params = await searchParams;
  const { page, pageSize } = parseListPaging(params);
  const sort = parseSortOrder(params.sort);
  const { totalCount, rows } = await searchServiceStoreCustomersPaginated(serviceStore.id, {
    q: params.q,
    page,
    pageSize,
    sort,
  });

  return (
    <PageShell
      title="Customers"
      description="Search customers by name, phone, or license plate."
      nav={serviceStoreNav}
      backHref="/service-store/dashboard"
    >
      <ListToolbar searchPlaceholder="Search name, phone, or plate" />
      <ListTable
        rows={rows}
        getRowKey={(customer) => customer.id}
        emptyLabel="No customers found."
        hasFilters={Boolean(params.q)}
        columns={[
          {
            key: "name",
            header: "Customer",
            render: (customer) => (
              <Link
                href={`/service-store/customers/${customer.id}`}
                className="font-semibold text-[#15202b] underline-offset-2 hover:underline"
              >
                {customer.firstName} {customer.lastName}
              </Link>
            ),
          },
          {
            key: "phone",
            header: "Phone",
            render: (customer) => customer.phone ?? "—",
          },
          {
            key: "vehicles",
            header: "Vehicles",
            render: (customer) =>
              customer.vehicles.map((vehicle) => vehicle.licensePlate).join(", ") || "—",
          },
          {
            key: "bookings",
            header: "Bookings",
            render: (customer) => customer._count.bookings,
          },
        ]}
      />
      <ListPagination page={page} pageSize={pageSize} totalCount={totalCount} searchParams={params} />
    </PageShell>
  );
}
