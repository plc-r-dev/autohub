import {
  CustomerButton,
  CustomerButtonLink,
  CustomerEmptyState,
  CustomerSkeleton,
  CustomerSectionHeader,
} from "@/components/customer/customer-ui";

/** @deprecated Use CustomerSkeleton */
export const LiffSkeleton = CustomerSkeleton;

/** @deprecated Use CustomerEmptyState */
export const LiffEmptyState = CustomerEmptyState;

/** @deprecated Use CustomerButton */
export const LiffPrimaryButton = CustomerButton;

/** @deprecated Use CustomerButtonLink variant secondary */
export function LiffSecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CustomerButtonLink href={href} variant="secondary" className={className}>
      {children}
    </CustomerButtonLink>
  );
}

/** @deprecated Use CustomerButtonLink */
export function LiffLineButton({
  href,
  children,
  className,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <CustomerButtonLink href={href} variant={variant} className={className}>
      {children}
    </CustomerButtonLink>
  );
}

/** @deprecated Use CustomerSectionHeader */
export const LiffSectionTitle = CustomerSectionHeader;
