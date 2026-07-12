export function buildBookingWizardHref(input: {
  serviceStoreId: string;
  serviceId?: string;
  branchId?: string;
  vehicleId?: string;
}) {
  const params = new URLSearchParams({ serviceStoreId: input.serviceStoreId });
  if (input.serviceId) params.set("serviceId", input.serviceId);
  if (input.branchId) params.set("branchId", input.branchId);
  if (input.vehicleId) params.set("vehicleId", input.vehicleId);
  return `/bookings/new?${params.toString()}`;
}
