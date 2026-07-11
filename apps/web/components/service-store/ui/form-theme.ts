import { cn } from "@workspace/ui/lib/utils";

const controlBase = [
  "w-full rounded-xl border border-[#dce5ee] bg-white px-4 text-[15px] text-[#15202b]",
  "transition-colors outline-none placeholder:text-[#8a97a5]",
  "hover:border-[#b8c5d3]",
  "focus:border-[#06C755] focus:ring-2 focus:ring-[#06C755]/15",
  "disabled:cursor-not-allowed disabled:opacity-50",
] as const;

export const serviceStoreInputClassName = cn(controlBase, "h-11");
export const serviceStoreSelectClassName = cn(serviceStoreInputClassName, "appearance-none pr-10");
export const serviceStoreTextareaClassName = cn(controlBase, "min-h-[120px] resize-y py-3");
export const serviceStoreLabelClassName =
  "text-sm font-medium text-[#15202b] transition-colors group-focus-within:text-[#06C755]";
export const serviceStoreFormErrorClassName = "text-sm text-red-600";
