"use client";

import { useState } from "react";
import { Expand } from "lucide-react";
import { ServiceShopImage } from "@/components/customer/ui/service-shop-image";
import { ImagePreviewLightbox } from "@/components/customer/ui/image-preview-lightbox";
import { MerchantRatingBadge } from "@/components/customer/merchant/merchant-booking-card";
import { getServiceShopGalleryImages, getServiceShopImage } from "@/lib/media/service-shop-images";

type MerchantHeroProps = {
  merchantId: string;
  name: string;
  description: string;
};

export function MerchantHero({ merchantId, name, description }: MerchantHeroProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const heroImage = getServiceShopImage(merchantId, name, 0);
  const galleryImages = getServiceShopGalleryImages(merchantId, name, 12);

  return (
    <>
      <section className="relative overflow-hidden rounded-[24px] shadow-[0_12px_48px_rgba(0,0,0,0.12)]">
        <div className="relative h-[320px] md:h-[420px]">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="absolute inset-0 z-0 cursor-zoom-in"
            aria-label={`Preview ${name} photos`}
          >
            <ServiceShopImage
              merchantId={merchantId}
              merchantName={name}
              priority
              sizes="100vw"
              className="absolute inset-0 h-full"
            />
          </button>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#062C21]/95 via-[#062C21]/40 to-transparent" />

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            aria-label="Preview photos"
          >
            <Expand className="size-4" />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-6 md:p-10">
            <MerchantRatingBadge />
            <h1 className="mt-4 max-w-3xl font-serif text-[36px] leading-[1.1] font-semibold tracking-tight text-white md:text-[48px]">
              {name}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/75 md:text-[16px]">
              {description}
            </p>
          </div>
        </div>
      </section>

      <ImagePreviewLightbox
        images={[heroImage, ...galleryImages]}
        initialIndex={0}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
