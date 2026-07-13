"use client";

import { useRouter } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";

type ReturnToLineButtonProps = {
  className?: string;
  variant?: "primary" | "secondary";
  children?: React.ReactNode;
};

type LiffWindow = Window & {
  liff?: {
    isInClient?: () => boolean;
    closeWindow?: () => void;
  };
};

export function ReturnToLineButton({
  className,
  variant = "secondary",
  children = "กลับไป LINE",
}: ReturnToLineButtonProps) {
  const router = useRouter();

  function handleClick() {
    const liff = (window as LiffWindow).liff;
    if (liff?.isInClient?.() && liff.closeWindow) {
      liff.closeWindow();
      return;
    }
    router.push("/browse");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-xl px-4 text-[15px] font-semibold active:opacity-90",
        variant === "primary"
          ? "bg-[#16A34A] text-white active:bg-[#15803D]"
          : "border border-[#e5e8eb] bg-white text-[#111] active:bg-[#f0f2f5]",
        className,
      )}
    >
      {children}
    </button>
  );
}
