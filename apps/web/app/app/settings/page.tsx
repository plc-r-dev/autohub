import { Suspense } from "react"
import { PageShell, serviceStoreNav } from "@/components/layout/page-shell"
import { ServicesPageFilters } from "@/components/listing/management/filters/services-page-filters"
import { StoreGeneralTab } from "@/components/store-settings/store-general-tab"
import { StoreHoursTab } from "@/components/store-settings/store-hours-tab"
import { StoreServicesTab } from "@/components/store-settings/store-services-tab"
import { StoreSettingsShell } from "@/components/store-settings/store-settings-shell"
import { StoreStaffTab } from "@/components/store-settings/store-staff-tab"
import type { StoreSettingsTab } from "@/components/store-settings/store-settings-tabs"
import { requireApprovedServiceStoreUser } from "@/lib/auth/domain-user"
import { listServiceStoreMembers } from "@/lib/service-store/application/member-queries"
import { requireServiceStoreContext } from "@/lib/service-store/context"
import { SERVICE_STORE_PERMISSION } from "@/lib/service-store/domain"
import { getStoreSettingsPageData } from "@/lib/service-store/store-settings-queries"

type PageProps = {
  searchParams: Promise<{
    tab?: string
    q?: string
    status?: string
    sort?: string
    page?: string
    pageSize?: string
  }>
}

function resolveTab(tab: string | undefined): StoreSettingsTab {
  if (tab === "services" || tab === "hours" || tab === "staff") {
    return tab
  }
  return "general"
}

export default async function StoreSettingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = resolveTab(params.tab)

  if (tab === "staff") {
    const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.MEMBERS_VIEW, {
      allowOnboarding: true,
    })
    const members = await listServiceStoreMembers(ctx.serviceStore.id)

    return (
      <PageShell title="Store Settings" nav={serviceStoreNav}>
        <StoreSettingsShell activeTab={tab}>
          <StoreStaffTab
            serviceStoreId={ctx.serviceStore.id}
            members={members}
            currentUserId={ctx.user.id}
            currentRole={ctx.membership.role}
          />
        </StoreSettingsShell>
      </PageShell>
    )
  }

  const { serviceStore } = await requireApprovedServiceStoreUser()
  const data = await getStoreSettingsPageData(serviceStore.id, serviceStore.name, params)

  return (
    <PageShell title="Store Settings" nav={serviceStoreNav}>
      <StoreSettingsShell activeTab={tab}>
        {tab === "general" ? <StoreGeneralTab general={data.general} /> : null}

        {tab === "services" ? (
          <>
            <Suspense fallback={null}>
              <ServicesPageFilters hasActiveFilters={data.services.hasFilters} />
            </Suspense>
            <StoreServicesTab
              services={data.services.rows}
              hasFilters={data.services.hasFilters}
              page={data.services.page}
              pageSize={data.services.pageSize}
              totalCount={data.services.totalCount}
              searchParams={params}
            />
          </>
        ) : null}

        {tab === "hours" ? <StoreHoursTab hours={data.hours} /> : null}
      </StoreSettingsShell>
    </PageShell>
  )
}
