import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ customerId: string }>
  searchParams: Promise<{ vehicleId?: string }>
}

export default async function ServiceStoreCustomerDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { customerId } = await params
  const query = await searchParams
  const vehicleQuery = query.vehicleId ? `&vehicleId=${query.vehicleId}` : ""

  redirect(`/app/customers?customerId=${customerId}${vehicleQuery}`)
}
