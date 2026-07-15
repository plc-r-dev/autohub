"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePreviewLightbox } from "@/components/customer/ui/image-preview-lightbox";
import { getServiceShopGalleryImages } from "@/lib/media/service-shop-images";

type GalleryImage = { src: string; alt: string };

type ServiceStoreGalleryProps = {
  serviceStoreId: string;
  serviceStoreName: string;
  images?: GalleryImage[];
};

export function ServiceStoreGallery({
  serviceStoreId,
  serviceStoreName,
  images,
}: ServiceStoreGalleryProps) {
  const fallback = getServiceShopGalleryImages(serviceStoreId, serviceStoreName, 12);
  const allImages = images != null ? images : fallback;
  const thumbnails = allImages.slice(0, 4);
  const extraCount = Math.max(0, allImages.length - 3);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <p className="text-[13px] text-[#94A3B8]">No store photos yet.</p>
    );
  }

  function openPreview(index: number) {
    setPreviewIndex(index);
    setPreviewOpen(true);
  }

  const showMoreTile = allImages.length > 3 && thumbnails[3];

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        {thumbnails.slice(0, showMoreTile ? 3 : 4).map((image, index) => {
          const isLocalUpload = image.src.startsWith("/api/storage/");
          return (
            <button
              key={`${serviceStoreId}-gallery-${index}-${image.src}`}
              type="button"
              onClick={() => openPreview(index)}
              className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.98]"
              aria-label={`Preview photo ${index + 1}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="96px"
                unoptimized={isLocalUpload}
                className="object-cover"
              />
            </button>
          );
        })}
        {showMoreTile ? (
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
              unoptimized={thumbnails[3]!.src.startsWith("/api/storage/")}
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-[#062C21]/55">
              <span className="text-[14px] font-semibold text-white">
                +{extraCount} More
              </span>
            </div>
          </button>
        ) : null}
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
