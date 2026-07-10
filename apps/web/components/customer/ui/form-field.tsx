import { cn } from "@workspace/ui/lib/utils";
import {
  customerFormErrorClassName,
  customerLabelClassName,
} from "@/components/customer/ui/form-theme";

type CustomerFormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  hideLabel?: boolean;
};

export function CustomerFormField({
  id,
  label,
  error,
  children,
  className,
  hideLabel = false,
}: CustomerFormFieldProps) {
  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className={cn(customerLabelClassName, hideLabel && "sr-only")}
      >
        {label}
      </label>
      {children}
      {error ? <p className={customerFormErrorClassName}>{error}</p> : null}
    </div>
  );
}
