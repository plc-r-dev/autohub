import { headers } from "next/headers";
import {
  customerAuth,
  serviceStoreAuth,
  type CustomerSession,
  type ServiceStoreSession,
} from "@/auth";

/** Customer portal session (`ah-customer.*` cookie). */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  return customerAuth.api.getSession({
    headers: await headers(),
  });
}

/** Service Store portal session (`ah-store.*` cookie). */
export async function getServiceStoreSession(): Promise<ServiceStoreSession | null> {
  return serviceStoreAuth.api.getSession({
    headers: await headers(),
  });
}

/**
 * @deprecated Use `getCustomerSession` or `getServiceStoreSession`.
 * Defaults to the Service Store session for existing `/app` callers.
 */
export async function getServerSession(): Promise<ServiceStoreSession | null> {
  return getServiceStoreSession();
}

export async function requireServerSession(): Promise<ServiceStoreSession> {
  const session = await getServiceStoreSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireCustomerServerSession(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
