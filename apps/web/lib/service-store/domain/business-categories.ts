export const SERVICE_STORE_BUSINESS_CATEGORIES = [
  { id: "car-wash", label: "Car Wash" },
  { id: "detailing", label: "Detailing" },
  { id: "ceramic", label: "Ceramic Coating" },
  { id: "oil-change", label: "Oil Change" },
  { id: "tire", label: "Tire Service" },
  { id: "battery", label: "Battery Service" },
  { id: "general-repair", label: "General Repair" },
  { id: "body-shop", label: "Body Shop" },
] as const;

export type ServiceStoreBusinessCategoryId =
  (typeof SERVICE_STORE_BUSINESS_CATEGORIES)[number]["id"];

export function businessCategoryLabel(id: string | null | undefined): string | null {
  if (!id) {
    return null;
  }
  return SERVICE_STORE_BUSINESS_CATEGORIES.find((row) => row.id === id)?.label ?? id;
}

export function slugifyBusinessCode(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
