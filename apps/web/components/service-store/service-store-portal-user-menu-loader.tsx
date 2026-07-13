import { ServiceStorePortalUserMenu } from "@/components/service-store/service-store-portal-user-menu";
import { requireServiceStoreSession } from "@/lib/auth/require-identity";

export async function ServiceStorePortalUserMenuLoader() {
  const { session } = await requireServiceStoreSession();

  return (
    <ServiceStorePortalUserMenu
      displayName={session.user.name ?? ""}
      avatarUrl={session.user.image ?? null}
    />
  );
}
