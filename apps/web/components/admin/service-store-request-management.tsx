import Chip from "@mui/material/Chip"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { ServiceStoreRequestActions } from "@/components/admin/service-store-request-actions"
import { AdminSectionCard } from "@/components/admin/ui/admin-section-card"
import {
  listPendingServiceStoreClaims,
  listPendingServiceStoreOnboardingRequests,
} from "@/lib/service-store/queries"
import { getPaymentSlipPreviewUrl } from "@/lib/storage/upload-service"

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  )
}

async function RequestDocLink({
  fileKey,
  fileName,
}: {
  fileKey: string
  fileName: string
}) {
  const url = await getPaymentSlipPreviewUrl(fileKey)
  if (!url) {
    return <Typography variant="body2">{fileName}</Typography>
  }
  return (
    <Link href={url} target="_blank" rel="noreferrer" variant="body2">
      {fileName}
    </Link>
  )
}

type UnifiedRequest =
  | {
      kind: "claim"
      id: string
      submittedAt: Date
      storeName: string
      storeSubtitle: string
      requesterName: string
      requesterPhone: string | null
      citizenIdFileName: string
      citizenIdKey: string
      companyDocumentFileName: string
      companyDocumentKey: string
      address?: null
      website?: null
      description?: null
    }
  | {
      kind: "onboarding-request"
      id: string
      submittedAt: Date
      storeName: string
      storeSubtitle: string
      requesterName: string
      requesterPhone: string | null
      citizenIdFileName: string
      citizenIdKey: string
      companyDocumentFileName: string
      companyDocumentKey: string
      address: string | null
      website: string | null
      description: string | null
    }

export async function ServiceStoreRequestManagement() {
  const [claims, onboardingRequests] = await Promise.all([
    listPendingServiceStoreClaims(),
    listPendingServiceStoreOnboardingRequests(),
  ])

  const unified: UnifiedRequest[] = [
    ...claims.map(
      (claim): UnifiedRequest => ({
        kind: "claim",
        id: claim.id,
        submittedAt: claim.submittedAt,
        storeName: claim.serviceStore.name,
        storeSubtitle: `${claim.serviceStore.code} · ${claim.serviceStore.status}`,
        requesterName: `${claim.user.firstName} ${claim.user.lastName}`,
        requesterPhone: claim.user.phone,
        citizenIdFileName: claim.citizenIdFileName,
        citizenIdKey: claim.citizenIdKey,
        companyDocumentFileName: claim.companyDocumentFileName,
        companyDocumentKey: claim.companyDocumentKey,
      }),
    ),
    ...onboardingRequests.map(
      (request): UnifiedRequest => ({
        kind: "onboarding-request",
        id: request.id,
        submittedAt: request.submittedAt,
        storeName: request.businessName,
        storeSubtitle: request.businessCode,
        requesterName: `${request.user.firstName} ${request.user.lastName}`,
        requesterPhone: request.user.phone,
        citizenIdFileName: request.citizenIdFileName,
        citizenIdKey: request.citizenIdKey,
        companyDocumentFileName: request.companyDocumentFileName,
        companyDocumentKey: request.companyDocumentKey,
        address: request.address,
        website: request.website,
        description: request.description,
      }),
    ),
  ].sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime())

  return (
    <AdminSectionCard
      title="Pending Service Store requests"
      action={
        <Chip
          size="small"
          label={`${unified.length} pending`}
          color="warning"
        />
      }
    >
      {unified.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No pending Service Store requests.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {unified.map((request) => (
            <AdminSectionCard key={`${request.kind}-${request.id}`}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: "center" }}>
                    <Typography variant="subtitle2">{request.storeName}</Typography>
                    <Chip
                      size="small"
                      label={request.kind === "claim" ? "Claim existing" : "Create store"}
                      color={request.kind === "claim" ? "info" : "default"}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {request.storeSubtitle}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">{request.requesterName}</Typography>
                  {request.requesterPhone ? (
                    <Typography variant="body2" color="text.secondary">
                      {request.requesterPhone}
                    </Typography>
                  ) : null}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Meta label="Submitted" value={formatDate(request.submittedAt)} />
                </Grid>
                {request.kind === "onboarding-request" && request.address ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Meta label="Address" value={request.address} />
                  </Grid>
                ) : null}
                {request.kind === "onboarding-request" && request.website ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Google Maps
                      </Typography>
                      <Link
                        href={request.website}
                        target="_blank"
                        rel="noreferrer"
                        variant="body2"
                      >
                        Open map
                      </Link>
                    </Stack>
                  </Grid>
                ) : null}
                {request.kind === "onboarding-request" && request.description ? (
                  <Grid size={12}>
                    <Meta label="Description" value={request.description} />
                  </Grid>
                ) : null}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">
                      Citizen ID
                    </Typography>
                    <RequestDocLink
                      fileKey={request.citizenIdKey}
                      fileName={request.citizenIdFileName}
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">
                      Store Document
                    </Typography>
                    <RequestDocLink
                      fileKey={request.companyDocumentKey}
                      fileName={request.companyDocumentFileName}
                    />
                  </Stack>
                </Grid>
              </Grid>
              <Stack sx={{ mt: 2 }}>
                <ServiceStoreRequestActions
                  type={request.kind === "claim" ? "claim" : "onboarding-request"}
                  requestId={request.id}
                />
              </Stack>
            </AdminSectionCard>
          ))}
        </Stack>
      )}
    </AdminSectionCard>
  )
}
