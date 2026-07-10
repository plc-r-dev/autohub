import { redirect } from "next/navigation";

/** Customer app entry — marketplace home. */
export default function RootPage() {
  redirect("/browse");
}
