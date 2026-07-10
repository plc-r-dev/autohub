type MerchantPortalLayoutProps = {
  children: React.ReactNode;
};

/** Merchant portal route group — pages own their chrome. */
export default function MerchantPortalLayout({
  children,
}: MerchantPortalLayoutProps) {
  return children;
}
