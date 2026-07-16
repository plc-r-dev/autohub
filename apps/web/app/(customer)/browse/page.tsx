import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { HomeHero } from "@/components/customer/home-hero";
import {
  BookingCard,
  ServiceStoreCard,
  type ServiceStoreCardData,
  SectionHeader,
  Skeleton,
  EmptyState,
  ButtonLink,
} from "@/components/customer/ui";
import { BrowseSearch } from "@/components/browse/browse-search";
import { BrowseServiceStoreFilters } from "@/components/browse/browse-service-store-filters";
import { listBrowseServiceStoresPaginated } from "@/lib/booking/discovery-queries";
import type { MarketplaceServiceStoreListItem } from "@/lib/booking/discovery-queries";
import { formatDistanceKm } from "@/lib/geo/distance";
import { toCustomerBookingCardData } from "@/lib/booking/customer-booking-mapper";
import { getCustomerBookingsPaginated } from "@/lib/booking/queries";
import { resolveIdentityLink } from "@/lib/auth/identity";
import { getCustomerForUser } from "@/lib/customer/context";
import { getCustomerSession } from "@/lib/auth/session";
import { parseListPaging, parseSortOrder } from "@/lib/listing/search-params";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
    nearby?: string;
    storeSlug?: string;
  }>;
};

const UPCOMING_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS"] as const;

function toServiceStoreCard(row: MarketplaceServiceStoreListItem): ServiceStoreCardData {
  return {
    id: row.id,
    name: row.name,
    bookHref: row.bookHref,
    phone: row.phone,
    imageUrl: row.imageUrl,
    hasApprovedClaim: row.hasApprovedClaim,
    canBook: row.booking.bookable,
    rating: "4.8",
    distance: formatDistanceKm(row.distanceKm) ?? "—",
    startingPrice: "฿299",
    openingStatus: "open",
  };
}

export default async function BrowsePage({ searchParams }: PageProps) {
  // Browse requires the customer portal session (independent from Service Store).
  const session = await getCustomerSession();
  const identity = session ? await resolveIdentityLink(session.user.id) : null;
  const customer = identity?.domainUserId
    ? await getCustomerForUser(identity.domainUserId)
    : null;
  const params = await searchParams;

  // LIFF Open Store: `?storeSlug={code}` → store profile
  const storeSlug = params.storeSlug?.trim();
  if (storeSlug) {
    const store = await prisma.serviceStore.findFirst({
      where: { code: storeSlug },
      select: { id: true },
    });
    if (store) {
      redirect(`/browse/${store.id}`);
    }
  }

  const { page, pageSize } = parseListPaging({
    ...params,
    pageSize: params.pageSize ?? "50",
  });
  const sort = parseSortOrder(params.sort ?? "asc");

  const [{ rows, isFallback }, bookingsResult] = await Promise.all([
    listBrowseServiceStoresPaginated({
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

  const serviceStores = rows.map(toServiceStoreCard);
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

  const upcomingCard = upcoming ? toCustomerBookingCardData(upcoming) : null;
  const recentCard = recent ? toCustomerBookingCardData(recent) : null;

  if (params.q) {
    return (
      <CustomerShell title="Search" subtitle="Results for your query">
        <div className="flex flex-col gap-6">
          <Suspense fallback={<Skeleton className="h-[52px]" />}>
            <BrowseSearch />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-10 w-48" />}>
            <BrowseServiceStoreFilters />
          </Suspense>
          {serviceStores.length === 0 ? (
            <EmptyState
              title="No results"
              description="Try a different search term or browse all service shops."
              action={<ButtonLink href="/browse">Browse all</ButtonLink>}
            />
          ) : (
            <>
              {isFallback ? (
                <p className="text-sm text-muted-foreground">
                  No exact matches — showing the closest service shops.
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {serviceStores.map((m) => (
                  <ServiceStoreCard key={m.id} serviceStore={m} />
                ))}
              </div>
            </>
          )}
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <div className="flex flex-col gap-8">
        <HomeHero displayName={displayName} />

        {upcomingCard ? (
          <section className="flex flex-col gap-4">
            <SectionHeader title="Upcoming booking" actionLabel="See all" actionHref="/bookings" />
            <div>
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Suspense fallback={<Skeleton className="h-10 w-48" />}>
              <BrowseServiceStoreFilters />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[52px] max-w-xl" />}>
              <BrowseSearch placeholder="Search service shops…" />
            </Suspense>
          </div>
          {serviceStores.length === 0 ? (
            <EmptyState
              title="No service shops yet"
              description="We're adding partners in your area. Check back soon."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {serviceStores.map((m) => (
                <ServiceStoreCard key={m.id} serviceStore={m} />
              ))}
            </div>
          )}
        </section>
      </div>
    </CustomerShell>
  );
}
