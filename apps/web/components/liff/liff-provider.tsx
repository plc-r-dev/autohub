"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LIFF_CONTEXT, type LiffRuntimeContext } from "@/lib/liff/types";

const LiffContext = createContext<LiffRuntimeContext>(DEFAULT_LIFF_CONTEXT);

type LiffProviderProps = {
  children: React.ReactNode;
  /** Server-detected context; future: hydrate from LIFF SDK on client. */
  initialContext?: LiffRuntimeContext;
};

/**
 * LIFF runtime provider (architecture stub).
 * Future: initialize @line/liff SDK and update context after liff.init().
 */
export function LiffProvider({ children, initialContext }: LiffProviderProps) {
  return (
    <LiffContext.Provider value={initialContext ?? DEFAULT_LIFF_CONTEXT}>
      {children}
    </LiffContext.Provider>
  );
}

export function useLiffContext(): LiffRuntimeContext {
  return useContext(LiffContext);
}
