import { cn } from "@workspace/ui/lib/utils";
import { serviceStoreFormErrorClassName, serviceStoreLabelClassName } from "./form-theme";

export function ServiceStoreFormField({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      <label htmlFor={id} className={serviceStoreLabelClassName}>
        {label}
      </label>
      {children}
      {error ? <p className={serviceStoreFormErrorClassName}>{error}</p> : null}
    </div>
  );
}
