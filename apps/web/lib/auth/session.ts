import { headers } from "next/headers";
import { auth, type Session } from "@/auth";

export async function getServerSession(): Promise<Session | null> {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireServerSession(): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
