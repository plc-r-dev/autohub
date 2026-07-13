"use client";

import { switchActiveServiceStore } from "@/lib/service-store/member-actions";
import { roleLabel } from "@/lib/service-store/domain";
import type { ServiceStoreMemberRole } from "@/lib/generated/prisma/client";

type MembershipOption = {
  role: ServiceStoreMemberRole;
  serviceStore: {
    id: string;
    name: string;
    code: string;
  };
};

/** Current Store selector — a header pill when there's one store, a compact dropdown when there are several. */
export function ServiceStoreSwitcher({
  memberships,
  activeServiceStoreId,
}: {
  memberships: MembershipOption[];
  activeServiceStoreId: string;
}) {
  if (memberships.length <= 1) {
    if (memberships.length === 1) {
      const row = memberships[0]!;
      return (
        <span className="hidden rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
          {row.serviceStore.name} · {roleLabel(row.role)}
        </span>
      );
    }
    return null;
  }

  return (
    <select
      id="serviceStoreId"
      name="serviceStoreId"
      aria-label="Current Service Store"
      defaultValue={activeServiceStoreId}
      className="hidden max-w-40 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none sm:inline-flex"
      onChange={async (event) => {
        const nextId = event.target.value;
        if (!nextId || nextId === activeServiceStoreId) {
          return;
        }
        await switchActiveServiceStore(nextId);
      }}
    >
      {memberships.map((row) => (
        <option key={row.serviceStore.id} value={row.serviceStore.id}>
          {row.serviceStore.name} ({roleLabel(row.role)})
        </option>
      ))}
    </select>
  );
}
