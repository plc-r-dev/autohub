import { cn } from "@workspace/ui/lib/utils";

/** Single source of truth for customer form control styling. */
export const customerFormTheme = {
  background: "#FFFFFF",
  label: "#0F172A",
  labelFocused: "#16A34A",
  inputText: "#0F172A",
  placeholder: "#9CA3AF",
  border: "#D1D5DB",
  borderHover: "#9CA3AF",
  borderFocused: "#16A34A",
  focusRing: "rgba(22, 163, 74, 0.1)",
  error: "#DC2626",
  radius: "16px",
  controlHeight: "52px",
} as const;

const controlBase = [
  "w-full bg-white text-[15px] text-[#0F172A]",
  "rounded-[16px] border border-[#D1D5DB] px-4",
  "transition-colors outline-none",
  "placeholder:text-[#9CA3AF]",
  "hover:border-[#9CA3AF]",
  "focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10",
  "disabled:cursor-not-allowed disabled:opacity-50",
] as const;

export const customerInputClassName = cn(controlBase, "h-[52px]");

export const customerSelectClassName = cn(
  customerInputClassName,
  "appearance-none pr-10",
);

export const customerTextareaClassName = cn(
  controlBase,
  "min-h-[120px] resize-y py-3",
);

export const customerLabelClassName =
  "text-[14px] font-medium text-[#0F172A] transition-colors group-focus-within:text-[#16A34A]";

export const customerFormErrorClassName = "text-[14px] text-red-600";
