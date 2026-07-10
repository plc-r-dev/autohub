type AdminPortalLayoutProps = {
  children: React.ReactNode;
};

/** Admin portal route group — pages own their chrome via AdminLayout. */
export default function AdminPortalLayout({ children }: AdminPortalLayoutProps) {
  return children;
}
