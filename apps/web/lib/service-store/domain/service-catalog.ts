export type ServiceCatalogService = {
  id: string;
  code: string;
  name: string;
  duration: number;
  bufferMinutes: number;
  price: string;
};

export type ServiceCatalogBranch = {
  id: string;
  name: string;
  services: ServiceCatalogService[];
};

export function formatServiceCatalogLabel(service: ServiceCatalogService) {
  return `${service.name} · ${service.code} · ${service.duration} min`;
}
