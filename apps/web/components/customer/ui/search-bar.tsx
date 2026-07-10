import { Search } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { customerInputClassName } from "@/components/customer/ui/form-theme";

type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search services…",
  className,
  id,
  name,
}: SearchBarProps) {
  return (
    <label className={cn("group relative block", className)}>
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[#9CA3AF]" />
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        className={cn(customerInputClassName, "pl-11 shadow-[0_1px_2px_rgba(0,0,0,0.04)]")}
      />
    </label>
  );
}
