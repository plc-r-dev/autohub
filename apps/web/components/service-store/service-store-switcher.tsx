"use client";

import { switchActiveServiceStore } from "@/lib/service-store/member-actions";
import { roleLabel } from "@/lib/service-store/domain";
import { serviceStoreSelectClassName } from "@/components/service-store/ui";
import type { ServiceStoreMemberRole } from "@/lib/generated/prisma/client";

type MembershipOption = {
  role: ServiceStoreMemberRole;
  serviceStore: {
    id: string;
    name: string;
    code: string;
  };
};

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
        <p className="px-3 text-xs text-[#8a97a5]">
          {row.serviceStore.name} · {roleLabel(row.role)}
        </p>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-1 px-3">
      <label htmlFor="serviceStoreId" className="text-xs font-medium text-[#8a97a5]">
        Active Service Store
      </label>
      <select
        id="serviceStoreId"
        name="serviceStoreId"
        defaultValue={activeServiceStoreId}
        className={serviceStoreSelectClassName}
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
    </div>
  );
}
