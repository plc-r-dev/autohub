import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { CustomerShell } from "@/components/customer/customer-shell";
import { Card } from "@/components/customer/ui";
import { requireDomainUser } from "@/lib/auth/domain-user";
import { PORTALS } from "@/lib/auth/portals";
import { getServerSession } from "@/lib/auth/session";
import { requireCustomerForUser } from "@/lib/customer/context";

export default async function ProfilePage() {
  const { user } = await requireDomainUser();
  const session = await getServerSession();
  const customer = await requireCustomerForUser(user.id);
  if (!customer) {
    redirect("/browse");
  }

  const displayName =
    customer.lineDisplayName?.trim() ||
    session?.user.name?.trim() ||
    `${customer.firstName} ${customer.lastName}`.trim() ||
    "User";
  const avatarUrl = customer.linePictureUrl || session?.user.image || null;

  return (
    <CustomerShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#0A0A0A] md:text-[36px]">
            Profile
          </h1>
          <p className="mt-2 text-[16px] text-[#64748B]">Your account and preferences</p>
        </div>

        <Card padding={false}>
          <div className="flex flex-col items-center px-6 py-12">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="size-28 rounded-full object-cover ring-4 ring-[#ECFDF5]"
              />
            ) : (
              <div className="flex size-28 items-center justify-center rounded-full bg-[#0F9B76] text-4xl font-semibold text-white ring-4 ring-[#ECFDF5]">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <h2 className="mt-6 text-[24px] font-semibold tracking-tight text-[#0A0A0A]">
              {displayName}
            </h2>
          </div>

          <dl className="divide-y divide-[#F1F5F9] border-t border-[#F1F5F9]">
            <div className="flex justify-between gap-4 px-6 py-5">
              <dt className="text-[14px] text-[#64748B]">Phone</dt>
              <dd className="text-[14px] font-medium text-[#0A0A0A]">
                {customer.phone?.trim() || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-6 py-5">
              <dt className="text-[14px] text-[#64748B]">Email</dt>
              <dd className="text-[14px] font-medium text-[#0A0A0A]">
                {customer.email?.trim() || user.email || "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <p className="mb-4 text-[13px] font-medium tracking-wide text-[#94A3B8] uppercase">
            Account
          </p>
          <LogoutButton redirectTo={PORTALS.customer.openInLine} />
        </Card>
      </div>
    </CustomerShell>
  );
}
