"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePreviewLightbox } from "@/components/customer/ui/image-preview-lightbox";
import { getServiceShopGalleryImages } from "@/lib/media/service-shop-images";

type MerchantGalleryProps = {
  merchantId: string;
  merchantName: string;
};

export function MerchantGallery({ merchantId, merchantName }: MerchantGalleryProps) {
  const thumbnails = getServiceShopGalleryImages(merchantId, merchantName, 4);
  const allImages = getServiceShopGalleryImages(merchantId, merchantName, 12);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  function openPreview(index: number) {
    setPreviewIndex(index);
    setPreviewOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        {thumbnails.slice(0, 3).map((image, index) => (
          <button
            key={`${merchantId}-gallery-${index}`}
            type="button"
            onClick={() => openPreview(index)}
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.98]"
            aria-label={`Preview photo ${index + 1}`}
          >
            <Image src={image.src} alt={image.alt} fill sizes="96px" className="object-cover" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => openPreview(3)}
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.98]"
          aria-label="Preview more photos"
        >
          <Image
            src={thumbnails[3]!.src}
            alt={thumbnails[3]!.alt}
            fill
            sizes="96px"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-[#062C21]/55">
            <span className="text-[14px] font-semibold text-white">+12 More</span>
          </div>
        </button>
      </div>

      <ImagePreviewLightbox
        images={allImages}
        initialIndex={previewIndex}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
