import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { ServiceStoreCard } from "@/components/service-store/ui";
import type { OnboardingSetupProgress } from "@/lib/service-store/domain";

export function ServiceStoreSetupProgress({
  progress,
  currentStep,
}: {
  progress: OnboardingSetupProgress;
  currentStep?: string;
}) {
  return (
    <ServiceStoreCard className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#0F172A]">Setup progress</h2>
        <p className="text-sm text-[#5b6b7a]">
          {progress.requiredMetCount}/{progress.requiredTotalCount} required steps
        </p>
      </div>
      <ul className="space-y-3">
        {progress.steps.map((step) => {
          const active = currentStep === step.id;
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={`flex items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                  active ? "border-[#16A34A] bg-[#F0FDF4]" : "border-[#eef3f7] hover:bg-[#f4f7fa]"
                }`}
              >
                {step.met ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#16A34A]" />
                ) : (
                  <Circle className="mt-0.5 size-5 shrink-0 text-[#b8c5d3]" />
                )}
                <div>
                  <p className="font-medium text-[#0F172A]">
                    {step.label}
                    {!step.required ? " (optional)" : ""}
                  </p>
                  <p className="text-[#8a97a5]">{step.description}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </ServiceStoreCard>
  );
}
