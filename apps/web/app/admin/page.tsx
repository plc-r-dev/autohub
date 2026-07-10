import { redirect } from "next/navigation";

/** Admin portal entry. */
export default function AdminEntryPage() {
  redirect("/admin/dashboard");
}
