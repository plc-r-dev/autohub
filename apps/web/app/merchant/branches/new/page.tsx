import { PageShell, merchantNav } from "@/components/layout/page-shell";
import { BranchForm } from "@/components/merchant/branch-form";

export default function NewBranchPage() {
  return (
    <PageShell
      title="New branch"
      description="Create a new branch location."
      nav={merchantNav}
      backHref="/merchant/branches"
    >
      <BranchForm mode="create" />
    </PageShell>
  );
}
