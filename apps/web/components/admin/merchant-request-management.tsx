import { MerchantRequestActions } from "@/components/admin/merchant-request-actions";
import {
  listPendingMerchantClaims,
  listPendingMerchantOnboardingRequests,
} from "@/lib/merchant/queries";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export async function MerchantRequestManagement() {
  const [claims, onboardingRequests] = await Promise.all([
    listPendingMerchantClaims(),
    listPendingMerchantOnboardingRequests(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-medium">Pending merchant claims</h2>
          <span className="text-muted-foreground text-sm">
            {claims.length} pending
          </span>
        </div>

        {claims.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No pending merchant claims.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {claims.map((claim) => (
              <article
                key={claim.id}
                className="border-input flex flex-col gap-4 rounded-md border p-4"
              >
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-medium">{claim.merchant.name}</p>
                    <p className="text-muted-foreground">
                      {claim.merchant.code} · {claim.merchant.status}
                    </p>
                  </div>
                  <div>
                    <p>
                      {claim.user.firstName} {claim.user.lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {claim.user.email ?? "No email"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tenant</p>
                    <p>
                      {claim.merchant.tenant.name} (
                      {claim.merchant.tenant.code})
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p>{formatDate(claim.submittedAt)}</p>
                  </div>
                </div>
                <MerchantRequestActions type="claim" requestId={claim.id} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-medium">
            Pending merchant onboarding requests
          </h2>
          <span className="text-muted-foreground text-sm">
            {onboardingRequests.length} pending
          </span>
        </div>

        {onboardingRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No pending merchant onboarding requests.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {onboardingRequests.map((request) => (
              <article
                key={request.id}
                className="border-input flex flex-col gap-4 rounded-md border p-4"
              >
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-medium">{request.businessName}</p>
                    <p className="text-muted-foreground">
                      {request.businessCode}
                    </p>
                  </div>
                  <div>
                    <p>
                      {request.user.firstName} {request.user.lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {request.user.email ?? "No email"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tenant</p>
                    <p>
                      {request.tenant.name} ({request.tenant.code})
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p>{formatDate(request.submittedAt)}</p>
                  </div>
                  {request.description ? (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground">Description</p>
                      <p>{request.description}</p>
                    </div>
                  ) : null}
                </div>
                <MerchantRequestActions
                  type="onboarding-request"
                  requestId={request.id}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
