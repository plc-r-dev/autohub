import { ImagePlaceholder } from "@/components/customer/ui/image-placeholder";

export type VehicleCardData = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  province: string | null;
  color: string | null;
};

type VehicleCardProps = {
  vehicle: VehicleCardData;
  footer?: React.ReactNode;
};

export function VehicleCard({ vehicle, footer }: VehicleCardProps) {
  return (
    <article className="overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <ImagePlaceholder
        label={vehicle.licensePlate}
        className="h-36"
        variant="vehicle"
      />
      <div className="p-6">
        <p className="text-[22px] font-semibold tracking-tight text-[#0A0A0A]">
          {vehicle.licensePlate}
        </p>
        <p className="mt-1 text-[15px] text-[#64748B]">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="mt-2 text-[14px] text-[#94A3B8]">
          {[vehicle.color, vehicle.province].filter(Boolean).join(" · ") || "No details"}
        </p>
      </div>
      {footer ? <div className="border-t border-[#F1F5F9]">{footer}</div> : null}
    </article>
  );
}
