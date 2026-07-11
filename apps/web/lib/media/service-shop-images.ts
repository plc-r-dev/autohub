/** Curated car-care photos — one unique image per service shop via stable hashing. */
const CAR_CARE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1553260168-69b041873e65?auto=format&fit=crop&w=1200&q=80",
    alt: "Car being washed at a service bay",
  },
  {
    src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80",
    alt: "Technician polishing a vehicle",
  },
  {
    src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80",
    alt: "Premium car detailing close-up",
  },
  {
    src: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=80",
    alt: "Foam wash on a sedan",
  },
  {
    src: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80",
    alt: "Car care workshop interior",
  },
  {
    src: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80",
    alt: "Vehicle being cleaned with microfiber",
  },
  {
    src: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80",
    alt: "Luxury car wash and detail",
  },
  {
    src: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1200&q=80",
    alt: "Exterior wash at a car care shop",
  },
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    alt: "Classic car after detailing",
  },
  {
    src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    alt: "Sports car in a studio wash",
  },
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    alt: "Sports car exterior care",
  },
  {
    src: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
    alt: "SUV receiving a hand wash",
  },
  {
    src: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    alt: "Car coated with cleaning foam",
  },
  {
    src: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=1200&q=80",
    alt: "Detailing spray on vehicle paint",
  },
  {
    src: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    alt: "Car in a professional wash tunnel",
  },
  {
    src: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
    alt: "Wheel and tire cleaning service",
  },
  {
    src: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1200&q=80",
    alt: "Vehicle drying after a premium wash",
  },
  {
    src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
    alt: "Interior vacuum and car care",
  },
] as const;

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getServiceShopImage(
  serviceStoreId: string,
  serviceStoreName: string,
  slot = 0,
): { src: string; alt: string } {
  const index =
    (hashSeed(`${serviceStoreId}:${slot}`) + slot * 7) % CAR_CARE_IMAGES.length;
  const image = CAR_CARE_IMAGES[index]!;

  return {
    src: image.src,
    alt: `${serviceStoreName} — ${image.alt}`,
  };
}

export function getServiceShopGalleryImages(
  serviceStoreId: string,
  serviceStoreName: string,
  count: number,
): Array<{ src: string; alt: string }> {
  const start = hashSeed(`${serviceStoreId}:gallery`) % CAR_CARE_IMAGES.length;

  return Array.from({ length: count }, (_, offset) => {
    const index = (start + offset + 1) % CAR_CARE_IMAGES.length;
    const image = CAR_CARE_IMAGES[index]!;

    return {
      src: image.src,
      alt: `${serviceStoreName} — ${image.alt}`,
    };
  });
}
