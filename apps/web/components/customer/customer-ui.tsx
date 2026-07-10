import {
  Button,
  ButtonLink,
  Card,
  EmptyState,
  SectionHeader,
  Skeleton,
} from "@/components/customer/ui";

/** Backward-compatible re-exports for legacy imports */
export { tokens as ah } from "@/components/customer/ui/tokens";

export const CustomerCard = Card;
export const CustomerButton = Button;
export const CustomerButtonLink = ButtonLink;
export const CustomerEmptyState = EmptyState;
export const CustomerSectionHeader = SectionHeader;
export const CustomerSkeleton = Skeleton;

export function CustomerPageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-2">
      {subtitle ? <p className="text-[14px] font-medium text-[#64748B]">{subtitle}</p> : null}
      <h1 className="text-[32px] font-semibold tracking-tight text-[#0A0A0A] md:text-[36px]">
        {title}
      </h1>
    </div>
  );
}

export function CustomerStickyFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E2E8F0]/80 bg-white/95 px-5 py-4 backdrop-blur-md md:px-8"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </div>
  );
}
