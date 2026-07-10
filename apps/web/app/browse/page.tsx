import { Suspense } from "react";
import { CustomerShell } from "@/components/customer/customer-shell";
import { HomeHero } from "@/components/customer/home-hero";
import {
  BookingCard,
  type BookingCardData,
  MerchantCard,
  type MerchantCardData,
  SectionHeader,
  Skeleton,
  EmptyState,
  ButtonLink,
} from "@/components/customer/ui";
import { BrowseSearch } from "@/components/browse/browse-search";
import { BrowseMerchantFilters } from "@/components/browse/browse-merchant-filters";
import { listBrowseMerchantsPaginated } from "@/lib/booking/discovery-queries";
import type { MarketplaceMerchantListItem } from "@/lib/booking/discovery-queries";
import { formatDistanceKm } from "@/lib/geo/distance";
import { getCustomerBookingsPaginated } from "@/lib/booking/queries";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { requireCustomerForUser } from "@/lib/customer/context";
import { getServerSession } from "@/lib/auth/session";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
    nearby?: string;
  }>;
};

const UPCOMING_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS"] as const;

function toMerchantCard(row: MarketplaceMerchantListItem): MerchantCardData {
  return {
    id: row.id,
    name: row.name,
    bookHref: row.bookHref,
    phone: row.phone,
    hasApprovedClaim: row.hasApprovedClaim,
    canBook: row.booking.bookable,
    rating: "4.8",
    distance: formatDistanceKm(row.distanceKm) ?? "—",
    startingPrice: "฿299",
    openingStatus: "open",
  };
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const { user } = await requireDomainUser();
  const session = await getServerSession();
  const customer = await requireCustomerForUser(user.id);
  const params = await searchParams;

  const { page, pageSize } = parseListPaging({
    ...params,
    pageSize: params.pageSize ?? "50",
  });
  const sort = parseSortOrder(params.sort ?? "asc");

  const [{ rows }, bookingsResult] = await Promise.all([
    listBrowseMerchantsPaginated({
      q: params.q,
      page,
      pageSize,
      sort,
      nearby: params.nearby === "1",
    }),
    customer
      ? getCustomerBookingsPaginated(customer.id, { page: 1, pageSize: 10, sort: "desc" })
      : Promise.resolve({ rows: [], totalCount: 0 }),
  ]);

  const merchants = rows.map(toMerchantCard);
  const displayName = session?.user.name?.trim() || "there";
  const now = new Date();

  const upcoming = bookingsResult.rows.find(
    (b) =>
      UPCOMING_STATUSES.includes(b.status as (typeof UPCOMING_STATUSES)[number]) &&
      new Date(b.bookingDate) >= now,
  );

  const recent = bookingsResult.rows.find(
    (b) => b.bookingNumber !== upcoming?.bookingNumber,
  );

  const upcomingCard: BookingCardData | null = upcoming
    ? {
        bookingNumber: upcoming.bookingNumber,
        merchantName: upcoming.branch.merchant.name,
        bookingDate: upcoming.bookingDate,
        vehiclePlate: upcoming.vehicle.licensePlate,
        status: upcoming.status,
      }
    : null;

  const recentCard: BookingCardData | null = recent
    ? {
        bookingNumber: recent.bookingNumber,
        merchantName: recent.branch.merchant.name,
        bookingDate: recent.bookingDate,
        vehiclePlate: recent.vehicle.licensePlate,
        status: recent.status,
      }
    : null;

  if (params.q) {
    return (
      <CustomerShell>
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-[32px] font-semibold tracking-tight text-[#0A0A0A]">Search</h1>
            <p className="mt-2 text-[16px] text-[#64748B]">Results for your query</p>
          </div>
          <Suspense fallback={<Skeleton className="h-[52px]" />}>
            <BrowseSearch />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-10 w-48" />}>
            <BrowseMerchantFilters />
          </Suspense>
          {merchants.length === 0 ? (
            <EmptyState
              title="No results"
              description="Try a different search term or browse all service shops."
              action={<ButtonLink href="/browse">Browse all</ButtonLink>}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {merchants.map((m) => (
                <MerchantCard key={m.id} merchant={m} />
              ))}
            </div>
          )}
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <div className="flex flex-col gap-12 md:gap-16">
        <HomeHero displayName={displayName} />

        {upcomingCard ? (
          <section className="flex flex-col gap-4">
            <SectionHeader title="Upcoming booking" actionLabel="See all" actionHref="/bookings" />
            <div className="max-w-2xl">
              <BookingCard booking={upcomingCard} />
            </div>
          </section>
        ) : null}

        {recentCard ? (
          <section className="flex flex-col gap-4">
            <SectionHeader title="Recent activity" />
            <div className="max-w-2xl">
              <BookingCard booking={recentCard} />
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-6">
          <SectionHeader
            title={params.nearby === "1" ? "Nearby service shops" : "All service shops"}
          />
          <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-10 w-48" />}>
              <BrowseMerchantFilters />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[52px] max-w-xl" />}>
              <BrowseSearch placeholder="Search service shops…" />
            </Suspense>
          </div>
          {merchants.length === 0 ? (
            <EmptyState
              title="No service shops yet"
              description="We're adding partners in your area. Check back soon."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {merchants.map((m) => (
                <MerchantCard key={m.id} merchant={m} />
              ))}
            </div>
          )}
        </section>
      </div>
    </CustomerShell>
  );
}
