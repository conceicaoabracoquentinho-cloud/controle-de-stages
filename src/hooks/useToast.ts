import { useCallback, useRef, useState } from "react";
import type { ToastState } from "../types";

export function useToast(durationMs = 2800) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, type });
      timerRef.current = setTimeout(() => setToast(null), durationMs);
    },
    [durationMs]
  );

  return { toast, showToast };
}
