"use client";

import { useState } from "react";
import {
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { ServiceStoreGallery } from "@/components/customer/service-store/service-store-gallery";
import { ButtonLink, ServiceCard } from "@/components/customer/ui";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";
import { ImagePreviewLightbox } from "@/components/customer/ui/image-preview-lightbox";
import { getServiceShopGalleryImages, getServiceShopImage } from "@/lib/media/service-shop-images";
import { buildBookingWizardHref } from "@/lib/booking/wizard";
import type { HoursRow, StoreOpenStatus } from "@/lib/booking/store-hours-display";
import { cn } from "@workspace/ui/lib/utils";

export type ServiceStoreDetailService = {
  id: string;
  name: string;
  duration: number;
  price: string;
  branchId: string;
  category: string;
};

type ServiceStoreDetailViewProps = {
  serviceStoreId: string;
  name: string;
  description: string;
  phone: string | null;
  address: string | null;
  distance: string | null;
  rating: string;
  reviewCount: number;
  openStatus: StoreOpenStatus;
  hours: HoursRow[];
  canBook: boolean;
  services: ServiceStoreDetailService[];
  categories: string[];
};

export function ServiceStoreDetailView({
  serviceStoreId,
  name,
  description,
  phone,
  address,
  distance,
  rating,
  reviewCount,
  openStatus,
  hours,
  canBook,
  services,
  categories,
}: ServiceStoreDetailViewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const heroImage = getServiceShopImage(serviceStoreId, name, 0);
  const galleryImages = getServiceShopGalleryImages(serviceStoreId, name, 8);
  const mapsQuery = address ?? name;
  const firstService = services[0];
  const primaryBookHref = firstService
    ? buildBookingWizardHref({
        serviceStoreId,
        serviceId: firstService.id,
        branchId: firstService.branchId,
      })
    : buildBookingWizardHref({ serviceStoreId });

  const grouped = categories.map((category) => ({
    category,
    items: services.filter((service) => service.category === category),
  }));
  const showGroupLabels = grouped.length > 1;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Identity banner — full width, compact on mobile, roomier on desktop */}
      <section className="relative overflow-hidden rounded-[20px] bg-[#062C21] shadow-lg">
        <div className="relative h-[200px] md:h-[260px]">
          <button type="button" onClick={() => setPreviewOpen(true)} className="absolute inset-0">
            <ServiceShopImage
              serviceStoreId={serviceStoreId}
              serviceStoreName={name}
              className="h-full"
              sizes="(min-width: 1024px) 1280px, 100vw"
              priority
            />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-[#062C21] via-[#062C21]/25 to-transparent" />

          <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-3 p-4 md:flex-row md:items-end md:justify-between md:gap-4 md:p-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-semibold text-[#9A3412]">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {rating}
                </span>
                <span className="text-[12px] text-white/70">({reviewCount})</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold text-white",
                    openStatus.isOpen ? "bg-[#16A34A]" : "bg-white/20",
                  )}
                >
                  {openStatus.label}
                </span>
              </div>
              <h1 className="mt-2 truncate text-[22px] font-semibold tracking-tight text-white md:text-[30px]">
                {name}
              </h1>
              {distance ? (
                <p className="mt-0.5 text-[13px] text-white/70">{distance} away</p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="hidden h-10 items-center gap-2 rounded-full bg-white/95 px-4 text-[13px] font-semibold text-[#0F172A] hover:bg-white md:inline-flex"
                >
                  <Phone className="size-4" />
                  Call
                </a>
              ) : null}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-10 items-center gap-2 rounded-full bg-white/95 px-4 text-[13px] font-semibold text-[#0F172A] hover:bg-white md:inline-flex"
              >
                <Navigation className="size-4" />
                Directions
              </a>
              {canBook ? (
                <ButtonLink
                  href={primaryBookHref}
                  className="min-w-[7.5rem] shadow-md md:min-w-0"
                  variant="primary"
                  size="sm"
                >
                  Book Now
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mobile-only quick actions row */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3 md:hidden">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[12px] bg-[#F8FAFC] text-[11px] font-semibold text-[#0F172A]"
            >
              <Phone className="size-4" />
              Call
            </a>
          ) : null}
          <a
            href="https://line.me/R/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[12px] bg-[#F0FDF4] text-[11px] font-semibold text-[#047857]"
          >
            <MessageCircle className="size-4" />
            LINE
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[12px] bg-[#F8FAFC] text-[11px] font-semibold text-[#0F172A]"
          >
            <Navigation className="size-4" />
            Maps
          </a>
        </div>
      </section>

      {/* Services (primary) + secondary info sidebar */}
      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-8">
        <section className="order-1 flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[19px] font-semibold tracking-tight text-[#0F172A] md:text-[22px]">
              Services
            </h2>
            <span className="text-[13px] text-[#94A3B8]">
              {services.length} {services.length === 1 ? "option" : "options"}
            </span>
          </div>

          {grouped.map((group) => (
            <div key={group.category} className="flex flex-col gap-3">
              {showGroupLabels ? (
                <p className="text-[12px] font-semibold tracking-wide text-[#94A3B8] uppercase">
                  {group.category}
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((service) => (
                  <ServiceCard
                    key={service.id}
                    name={service.name}
                    duration={service.duration}
                    price={service.price}
                    bookHref={buildBookingWizardHref({
                      serviceStoreId,
                      serviceId: service.id,
                      branchId: service.branchId,
                    })}
                    canBook={canBook}
                    serviceStoreId={serviceStoreId}
                    imageSeed={service.name}
                    imageSlot={service.name.length % 6}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="order-2 mt-8 flex flex-col gap-4 lg:mt-0 lg:sticky lg:top-6">
          {address ? (
            <div className="rounded-[16px] bg-white p-4 shadow-sm">
              <p className="flex items-start gap-2 text-[13px] text-[#64748B]">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {address}
              </p>
            </div>
          ) : null}

          <div className="rounded-[16px] bg-white p-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-[#0F172A]">Opening hours</h2>
            <ul className="mt-2.5 space-y-1.5">
              {hours.map((row) => (
                <li
                  key={row.day}
                  className={cn(
                    "flex justify-between text-[13px]",
                    row.isToday ? "font-semibold text-[#0F172A]" : "text-[#64748B]",
                  )}
                >
                  <span>{row.day}</span>
                  <span>{row.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {description ? (
            <div className="rounded-[16px] bg-white p-4 shadow-sm">
              <h2 className="text-[14px] font-semibold text-[#0F172A]">About</h2>
              <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-[#64748B]">
                {description}
              </p>
            </div>
          ) : null}

          <div className="rounded-[16px] bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-[14px] font-semibold text-[#0F172A]">Photos</h2>
            <ServiceStoreGallery serviceStoreId={serviceStoreId} serviceStoreName={name} />
          </div>
        </aside>
      </div>

      <ImagePreviewLightbox
        images={[heroImage, ...galleryImages]}
        initialIndex={0}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
