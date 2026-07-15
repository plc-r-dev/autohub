import { cn } from "@workspace/ui/lib/utils";
import { serviceStoreFormErrorClassName, serviceStoreLabelClassName } from "./form-theme";

export function ServiceStoreFormField({
  id,
  label,
  error,
  required = false,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      <label htmlFor={id} className={serviceStoreLabelClassName}>
        {label}
        {required ? (
          <span className="ml-1 text-[#DC2626]" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? <p className={serviceStoreFormErrorClassName}>{error}</p> : null}
    </div>
  );
}
