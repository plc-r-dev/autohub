import { cn } from "@workspace/ui/lib/utils";

const controlBase = [
  "w-full rounded-xl border border-border bg-card px-4 text-[15px] text-foreground",
  "dark:[color-scheme:dark]",
  "transition-colors outline-none placeholder:text-muted-foreground",
  "hover:border-border/80",
  "focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15 dark:focus:border-foreground dark:focus:ring-foreground/15",
  "disabled:cursor-not-allowed disabled:opacity-50",
] as const;

export const serviceStoreInputClassName = cn(controlBase, "h-11");
export const serviceStoreSelectClassName = cn(serviceStoreInputClassName, "appearance-none pr-10");
export const serviceStoreTextareaClassName = cn(controlBase, "min-h-[120px] resize-y py-3");
export const serviceStoreLabelClassName =
  "text-sm font-medium text-foreground transition-colors group-focus-within:text-[#16A34A] dark:group-focus-within:text-foreground";
export const serviceStoreFormErrorClassName = "text-sm text-red-600 dark:text-red-400";
