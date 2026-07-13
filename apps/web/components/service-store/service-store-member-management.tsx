"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  inviteServiceStoreMember,
  removeServiceStoreMember,
  transferServiceStoreOwnership,
  updateServiceStoreMemberRole,
  type MemberActionState,
} from "@/lib/service-store/member-actions";
import {
  ServiceStoreButton,
  ServiceStoreFormField,
  serviceStoreInputClassName,
  serviceStoreSelectClassName,
} from "@/components/service-store/ui";
import { ASSIGNABLE_MEMBER_ROLES, roleLabel } from "@/lib/service-store/domain";
import type { ServiceStoreMemberRole } from "@/lib/generated/prisma/client";

type MemberRow = {
  id: string;
  role: ServiceStoreMemberRole;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
};

const initialState: MemberActionState = {};

export function ServiceStoreMemberManagement({
  members,
  currentUserId,
  currentRole,
  canManage,
}: {
  members: MemberRow[];
  currentUserId: string;
  currentRole: ServiceStoreMemberRole;
  canManage: boolean;
}) {
  const [inviteState, inviteAction, invitePending] = useActionState(
    inviteServiceStoreMember,
    initialState,
  );

  return (
    <div className="flex flex-col gap-6">
      {canManage ? (
        <form action={inviteAction} className="flex flex-col gap-4 rounded-2xl border border-[#dce5ee] bg-white p-5">
          <h3 className="text-sm font-semibold text-[#0F172A]">Invite member</h3>
          <p className="text-sm text-[#5b6b7a]">
            Add a team member by phone number. They must have signed in with LINE at least once.
          </p>
          {inviteState.error ? <p className="text-sm text-red-600">{inviteState.error}</p> : null}
          {inviteState.success ? (
            <p className="text-sm text-[#0F172A]">{inviteState.success}</p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <ServiceStoreFormField
              id="phone"
              label="Phone number"
              error={inviteState.fieldErrors?.phone?.[0]}
            >
              <input
                id="phone"
                name="phone"
                required
                className={serviceStoreInputClassName}
                placeholder="Same phone on their profile"
              />
            </ServiceStoreFormField>
            <ServiceStoreFormField id="role" label="Role" error={inviteState.fieldErrors?.role?.[0]}>
              <select id="role" name="role" required className={serviceStoreSelectClassName} defaultValue="STAFF">
                {ASSIGNABLE_MEMBER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
            </ServiceStoreFormField>
          </div>
          <ServiceStoreButton type="submit" disabled={invitePending}>
            {invitePending ? "Adding..." : "Add member"}
          </ServiceStoreButton>
        </form>
      ) : null}

      <div className="flex flex-col gap-3">
        {members.map((member) => (
          <MemberRowActions
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            currentRole={currentRole}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}

function MemberRowActions({
  member,
  currentUserId,
  currentRole,
  canManage,
}: {
  member: MemberRow;
  currentUserId: string;
  currentRole: ServiceStoreMemberRole;
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isSelf = member.user.id === currentUserId;
  const isOwner = member.role === "OWNER";

  function runAction(action: (prev: MemberActionState, data: FormData) => Promise<MemberActionState>, data: FormData) {
    startTransition(async () => {
      await action(initialState, data);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#eef3f7] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-[#0F172A]">
          {member.user.firstName} {member.user.lastName}
          {isSelf ? " (you)" : ""}
        </p>
        <p className="text-sm text-[#8a97a5]">
          {roleLabel(member.role)}
          {member.user.phone ? ` · ${member.user.phone}` : ""}
          {member.user.email ? ` · ${member.user.email}` : ""}
        </p>
      </div>

      {canManage && !isSelf ? (
        <div className="flex flex-wrap gap-2">
          {!isOwner ? (
            <>
              <form
                action={(formData) => runAction(updateServiceStoreMemberRole, formData)}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="memberId" value={member.id} />
                <select
                  name="role"
                  defaultValue={member.role}
                  className={serviceStoreSelectClassName}
                  onChange={(event) => event.currentTarget.form?.requestSubmit()}
                >
                  {ASSIGNABLE_MEMBER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
              </form>
              <ServiceStoreButton
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => {
                  const formData = new FormData();
                  formData.set("memberId", member.id);
                  runAction(removeServiceStoreMember, formData);
                }}
              >
                Remove
              </ServiceStoreButton>
            </>
          ) : null}
          {currentRole === "OWNER" && !isOwner ? (
            <ServiceStoreButton
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => {
                const formData = new FormData();
                formData.set("memberId", member.id);
                runAction(transferServiceStoreOwnership, formData);
              }}
            >
              Make Owner
            </ServiceStoreButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
