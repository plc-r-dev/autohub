import { cn } from "@workspace/ui/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[20px] bg-[#E2E8F0]/70", className)} />;
}

export function MerchantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <Skeleton className="h-44 rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
