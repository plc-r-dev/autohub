export function formatVehicleSelectLabel(vehicle: {
  brand: string;
  model: string;
  licensePlate: string;
}): string {
  return `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`;
}
