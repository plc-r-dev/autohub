"use server";

import { requireServiceStoreContext } from "@/lib/service-store/context";
import { SERVICE_STORE_PERMISSION } from "@/lib/service-store/domain";
import { parseDashboardDateKey } from "@/lib/reporting/dashboard-date";
import { getServiceStoreDashboardMetrics } from "@/lib/reporting/queries";

export async function refreshDashboardMetrics(dateKey?: string) {
  const ctx = await requireServiceStoreContext(SERVICE_STORE_PERMISSION.STORE_VIEW);
  return getServiceStoreDashboardMetrics(ctx.serviceStore.id, {
    date: parseDashboardDateKey(dateKey),
  });
}
