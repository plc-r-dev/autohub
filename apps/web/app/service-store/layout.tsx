type ServiceStorePortalLayoutProps = {
  children: React.ReactNode;
};

/** ServiceStore portal route group — pages own their chrome. */
export default function ServiceStorePortalLayout({
  children,
}: ServiceStorePortalLayoutProps) {
  return children;
}
