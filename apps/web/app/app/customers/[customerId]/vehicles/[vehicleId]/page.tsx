import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ customerId: string; vehicleId: string }>
}

export default async function ServiceStoreVehicleDetailPage({ params }: PageProps) {
  const { customerId, vehicleId } = await params
  redirect(`/app/customers?customerId=${customerId}&vehicleId=${vehicleId}`)
}
