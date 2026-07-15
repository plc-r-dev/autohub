import { notFound } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { ServiceStoreDetailView } from "@/components/customer/service-store/service-store-detail-view";
import { getStoreDisplayRating } from "@/lib/booking/customer-display";
import { getBrowseServiceStore } from "@/lib/booking/discovery-queries";
import {
  formatOperatingHoursRows,
  resolveStoreOpenStatus,
} from "@/lib/booking/store-hours-display";
import { businessCategoryLabel } from "@/lib/service-store/domain";
import { formatDistanceKm } from "@/lib/geo/distance";
import { prisma } from "@/lib/prisma";
import { getDefaultOperatingHours } from "@/lib/booking/engine/time";
import { buildSignedStorageUrl } from "@/lib/storage/signed-url";

type PageProps = {
  params: Promise<{ serviceStoreId: string }>;
};

export default async function BrowseServiceStorePage({ params }: PageProps) {
  const { serviceStoreId } = await params;
  const serviceStore = await getBrowseServiceStore(serviceStoreId);
  if (!serviceStore) notFound();

  const [services, hoursRows] = await Promise.all([
    prisma.service.findMany({
      where: {
        isActive: true,
        branch: { serviceStoreId },
      },
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
        branchId: true,
        imageKey: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.branchOperatingHours.findMany({
      where: { branch: { serviceStoreId } },
      select: {
        dayOfWeek: true,
        openTime: true,
        closeTime: true,
        isClosed: true,
      },
      orderBy: { dayOfWeek: "asc" },
      take: 7,
    }),
  ]);

  const category =
    businessCategoryLabel(
      (
        await prisma.serviceStore.findUnique({
          where: { id: serviceStoreId },
          select: { businessCategory: true },
        })
      )?.businessCategory,
    ) ?? "All Services";

  const categories = [category];
  const { rating, reviewCount } = getStoreDisplayRating(serviceStoreId);
  const address = serviceStore.branches.find((branch) => branch.address)?.address ?? null;
  const phone = serviceStore.phone ?? serviceStore.branches.find((branch) => branch.phone)?.phone ?? null;
  const operatingHours =
    hoursRows.length > 0
      ? hoursRows
      : getDefaultOperatingHours().map((row) => ({
          dayOfWeek: row.dayOfWeek,
          openTime: row.openTime,
          closeTime: row.closeTime,
          isClosed: row.isClosed,
        }));
  return (
    <CustomerShell backHref="/browse" backLabel="Nearby stores">
      <ServiceStoreDetailView
        serviceStoreId={serviceStore.id}
        name={serviceStore.name}
        description={
          serviceStore.description?.trim() ||
          "Premium automotive care with certified technicians and concierge-level service."
        }
        phone={phone}
        address={address}
        distance={formatDistanceKm(serviceStore.distanceKm) ?? null}
        rating={rating}
        reviewCount={reviewCount}
        openStatus={resolveStoreOpenStatus(operatingHours)}
        hours={formatOperatingHoursRows(operatingHours)}
        canBook={serviceStore.booking.bookable}
        imageUrl={serviceStore.imageUrl}
        galleryImages={serviceStore.galleryImages}
        services={services.map((service) => ({
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price.toString(),
          branchId: service.branchId,
          category,
          imageUrl: service.imageKey
            ? buildSignedStorageUrl(service.imageKey, 3600)
            : null,
        }))}
        categories={categories}
      />
    </CustomerShell>
  );
}
