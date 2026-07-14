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

export async function ServiceStoreRequestManagement() {
  const [claims, onboardingRequests] = await Promise.all([
    listPendingServiceStoreClaims(),
    listPendingServiceStoreOnboardingRequests(),
  ])

  const claimDocs = await Promise.all(
    claims.map(async (claim) => ({
      id: claim.id,
      citizenIdUrl: await getPaymentSlipPreviewUrl(claim.citizenIdKey),
      companyDocumentUrl: await getPaymentSlipPreviewUrl(
        claim.companyDocumentKey,
      ),
    })),
  )
  const claimDocById = new Map(claimDocs.map((row) => [row.id, row]))

  return (
    <Stack spacing={2.5}>
      <AdminSectionCard
        title="Pending Service Store claims"
        action={
          <Chip size="small" label={`${claims.length} pending`} color="warning" />
        }
      >
        {claims.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No pending Service Store claims.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {claims.map((claim) => {
              const docs = claimDocById.get(claim.id)
              return (
                <AdminSectionCard key={claim.id}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2">
                        {claim.serviceStore.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {claim.serviceStore.code} · {claim.serviceStore.status}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2">
                        {claim.user.firstName} {claim.user.lastName}
                      </Typography>
                      {claim.user.phone ? (
                        <Typography variant="body2" color="text.secondary">
                          {claim.user.phone}
                        </Typography>
                      ) : null}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Meta
                        label="Submitted"
                        value={formatDate(claim.submittedAt)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.secondary">
                          Citizen ID
                        </Typography>
                        {docs?.citizenIdUrl ? (
                          <Link
                            href={docs.citizenIdUrl}
                            target="_blank"
                            rel="noreferrer"
                            variant="body2"
                          >
                            {claim.citizenIdFileName}
                          </Link>
                        ) : (
                          <Typography variant="body2">
                            {claim.citizenIdFileName}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.secondary">
                          Store Document
                        </Typography>
                        {docs?.companyDocumentUrl ? (
                          <Link
                            href={docs.companyDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            variant="body2"
                          >
                            {claim.companyDocumentFileName}
                          </Link>
                        ) : (
                          <Typography variant="body2">
                            {claim.companyDocumentFileName}
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                  <Stack sx={{ mt: 2 }}>
                    <ServiceStoreRequestActions
                      type="claim"
                      requestId={claim.id}
                    />
                  </Stack>
                </AdminSectionCard>
              )
            })}
          </Stack>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Pending create-store requests"
        action={
          <Chip
            size="small"
            label={`${onboardingRequests.length} pending`}
            color="warning"
          />
        }
      >
        {onboardingRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No pending create-store requests.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {onboardingRequests.map((request) => (
              <AdminSectionCard key={request.id}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">
                      {request.businessName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.businessCode}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2">
                      {request.user.firstName} {request.user.lastName}
                    </Typography>
                    {request.user.phone ? (
                      <Typography variant="body2" color="text.secondary">
                        {request.user.phone}
                      </Typography>
                    ) : null}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Meta
                      label="Submitted"
                      value={formatDate(request.submittedAt)}
                    />
                  </Grid>
                  {request.address ? (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Meta label="Address" value={request.address} />
                    </Grid>
                  ) : null}
                  {request.website ? (
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
                  {request.description ? (
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
                    type="onboarding-request"
                    requestId={request.id}
                  />
                </Stack>
              </AdminSectionCard>
            ))}
          </Stack>
        )}
      </AdminSectionCard>
    </Stack>
  )
}
