"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export type PreviewImage = {
  src: string;
  alt: string;
};

type ImagePreviewLightboxProps = {
  images: PreviewImage[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
};

export function ImagePreviewLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
}: ImagePreviewLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft" && images.length > 1) {
        setIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight" && images.length > 1) {
        setIndex((current) => (current + 1) % images.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, images.length]);

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  if (!open || images.length === 0 || !mounted) {
    return null;
  }

  const current = images[index]!;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0A0A0A]/90"
        aria-label="Close preview"
        onClick={onClose}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute top-1/2 left-4 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute top-1/2 right-4 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="size-5" />
          </button>
          <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white backdrop-blur-sm">
            {index + 1} / {images.length}
          </p>
        </>
      ) : null}

      <div
        className={cn(
          "relative z-[1] mx-4 h-[min(80vh,720px)] w-full max-w-5xl overflow-hidden rounded-[16px]",
          "shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={current.src}
          alt={current.alt}
          fill
          sizes="100vw"
          className="object-contain bg-black"
          priority
        />
      </div>
    </div>,
    document.body,
  );
}
