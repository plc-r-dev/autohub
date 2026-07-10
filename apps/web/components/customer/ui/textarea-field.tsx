import { cn } from "@workspace/ui/lib/utils";
import { customerTextareaClassName } from "@/components/customer/ui/form-theme";

type TextareaFieldProps = React.ComponentProps<"textarea">;

export function TextareaField({ className, ...props }: TextareaFieldProps) {
  return (
    <textarea
      className={cn(customerTextareaClassName, className)}
      {...props}
    />
  );
}
