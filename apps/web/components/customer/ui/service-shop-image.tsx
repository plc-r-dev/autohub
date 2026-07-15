"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePreviewLightbox, type PreviewImage } from "@/components/customer/ui/image-preview-lightbox";
import { getServiceShopImage } from "@/lib/media/service-shop-images";
import { cn } from "@workspace/ui/lib/utils";

type ServiceShopImageProps = {
  serviceStoreId: string;
  serviceStoreName: string;
  /** Real store logo/cover URL. Falls back to curated placeholder when absent. */
  imageUrl?: string | null;
  slot?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  previewable?: boolean;
  previewImages?: PreviewImage[];
  previewIndex?: number;
};

export function ServiceShopImage({
  serviceStoreId,
  serviceStoreName,
  imageUrl,
  slot = 0,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 400px",
  previewable = false,
  previewImages,
  previewIndex = 0,
}: ServiceShopImageProps) {
  const placeholder = getServiceShopImage(serviceStoreId, serviceStoreName, slot);
  const src = imageUrl?.trim() || placeholder.src;
  const alt = imageUrl?.trim()
    ? `${serviceStoreName} store photo`
    : placeholder.alt;
  const [previewOpen, setPreviewOpen] = useState(false);
  const images = previewImages ?? [{ src, alt }];
  const startIndex = previewImages ? previewIndex : 0;
  const isLocalUpload = src.startsWith("/api/storage/");

  const imageContent = (
    <div className={cn("relative overflow-hidden bg-[#134E4A]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={isLocalUpload}
        className={cn("object-cover", imageClassName)}
      />
      {previewable ? (
        <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
      ) : null}
    </div>
  );

  if (!previewable) {
    return imageContent;
  }

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setPreviewOpen(true);
        }}
        className="group block w-full cursor-zoom-in text-left"
        aria-label={`Preview ${serviceStoreName} photo`}
      >
        {imageContent}
      </button>
      <ImagePreviewLightbox
        images={images}
        initialIndex={startIndex}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
