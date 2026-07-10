import { cn } from "@workspace/ui/lib/utils";

/** Single source of truth for customer form control styling. */
export const customerFormTheme = {
  background: "#FFFFFF",
  label: "#111827",
  labelFocused: "#0F9B76",
  inputText: "#111827",
  placeholder: "#9CA3AF",
  border: "#D1D5DB",
  borderHover: "#9CA3AF",
  borderFocused: "#0F9B76",
  focusRing: "rgba(15, 155, 118, 0.1)",
  error: "#DC2626",
  radius: "16px",
  controlHeight: "52px",
} as const;

const controlBase = [
  "w-full bg-white text-[15px] text-[#111827]",
  "rounded-[16px] border border-[#D1D5DB] px-4",
  "transition-colors outline-none",
  "placeholder:text-[#9CA3AF]",
  "hover:border-[#9CA3AF]",
  "focus:border-[#0F9B76] focus:ring-2 focus:ring-[#0F9B76]/10",
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
  "text-[14px] font-medium text-[#111827] transition-colors group-focus-within:text-[#0F9B76]";

export const customerFormErrorClassName = "text-[14px] text-red-600";
