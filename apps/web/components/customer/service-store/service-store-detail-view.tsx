"use client";

import { useState } from "react";
import {
  Clock,
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
import { getServiceDisplayDescription } from "@/lib/booking/customer-display";
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
        step: "vehicle",
      })
    : buildBookingWizardHref({ serviceStoreId, step: "service" });

  const grouped = categories.map((category) => ({
    category,
    items: services.filter((service) => service.category === category),
  }));

  return (
    <div className="flex flex-col gap-5 pb-28">
      <section className="relative overflow-hidden rounded-[20px] bg-[#062C21] shadow-lg">
        <div className="relative h-[200px]">
          <button type="button" onClick={() => setPreviewOpen(true)} className="absolute inset-0">
            <ServiceShopImage
              serviceStoreId={serviceStoreId}
              serviceStoreName={name}
              className="h-full"
              sizes="420px"
              priority
            />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-[#062C21] via-transparent to-transparent" />
          <div className="absolute top-4 left-4 flex size-14 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm">
            <ServiceShopImage
              serviceStoreId={serviceStoreId}
              serviceStoreName={name}
              slot={1}
              className="size-full rounded-full"
              sizes="56px"
            />
          </div>
        </div>

        <div className="relative -mt-8 px-4 pb-4">
          <div className="rounded-[18px] bg-white p-4 shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-1 text-[12px] font-semibold text-[#9A3412]">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {rating}
              </span>
              <span className="text-[12px] text-[#64748B]">({reviewCount} reviews)</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold text-white",
                  openStatus.isOpen ? "bg-[#0F9B76]" : "bg-[#64748B]",
                )}
              >
                {openStatus.label}
              </span>
            </div>
            <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-[#0A0A0A]">{name}</h1>
            {distance ? <p className="mt-1 text-[13px] text-[#64748B]">{distance} away</p> : null}
            {address ? (
              <p className="mt-2 flex items-start gap-2 text-[13px] text-[#64748B]">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {address}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-3 gap-2">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[12px] bg-[#F8FAFC] text-[11px] font-semibold text-[#0A0A0A]"
                >
                  <Phone className="size-4" />
                  Call
                </a>
              ) : null}
              <a
                href={`https://line.me/R/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[12px] bg-[#ECFDF5] text-[11px] font-semibold text-[#047857]"
              >
                <MessageCircle className="size-4" />
                LINE
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[12px] bg-[#F8FAFC] text-[11px] font-semibold text-[#0A0A0A]"
              >
                <Navigation className="size-4" />
                Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[18px] bg-white p-4 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[#0A0A0A]">Opening hours</h2>
        <ul className="mt-3 space-y-2">
          {hours.map((row) => (
            <li
              key={row.day}
              className={cn(
                "flex justify-between text-[13px]",
                row.isToday ? "font-semibold text-[#0A0A0A]" : "text-[#64748B]",
              )}
            >
              <span>{row.day}</span>
              <span>{row.hours}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[18px] bg-white p-4 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[#0A0A0A]">About</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">{description}</p>
      </section>

      <ServiceStoreGallery serviceStoreId={serviceStoreId} serviceStoreName={name} />

      <section className="space-y-4">
        <h2 className="text-[15px] font-semibold text-[#0A0A0A]">Services</h2>
        {grouped.map((group) => (
          <div key={group.category} className="space-y-3">
            <p className="text-[12px] font-semibold tracking-wide text-[#94A3B8] uppercase">
              {group.category}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    step: "vehicle",
                  })}
                  showPrice={true}
                  canBook={canBook}
                  description={getServiceDisplayDescription(service.name, description)}
                  serviceStoreId={serviceStoreId}
                  imageSeed={service.name}
                  imageSlot={service.name.length % 6}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {canBook ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E8EDF2] bg-white/95 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto w-full max-w-[420px]">
            <ButtonLink href={primaryBookHref} className="w-full" variant="dark">
              Book Now
            </ButtonLink>
          </div>
        </div>
      ) : null}

      <ImagePreviewLightbox
        images={[heroImage, ...galleryImages]}
        initialIndex={0}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
