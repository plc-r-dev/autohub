import { ChevronDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { customerSelectClassName } from "@/components/customer/ui/form-theme";

type SelectFieldProps = React.ComponentProps<"select">;

export function SelectField({ className, children, ...props }: SelectFieldProps) {
  return (
    <div className="relative">
      <select className={cn(customerSelectClassName, className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-[#9CA3AF]"
        aria-hidden
      />
    </div>
  );
}
