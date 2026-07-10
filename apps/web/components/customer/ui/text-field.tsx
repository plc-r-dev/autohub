import { cn } from "@workspace/ui/lib/utils";
import { customerInputClassName } from "@/components/customer/ui/form-theme";

type TextFieldProps = React.ComponentProps<"input">;

export function TextField({ className, ...props }: TextFieldProps) {
  return (
    <input
      className={cn(customerInputClassName, className)}
      {...props}
    />
  );
}
