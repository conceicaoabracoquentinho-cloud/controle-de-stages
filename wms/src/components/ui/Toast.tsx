import { colors, radius } from "../../styles/tokens";
import type { ToastState } from "../../types";

interface ToastProps {
  toast: ToastState | null;
}

const PALETTE: Record<ToastState["type"], { bg: string; color: string; border: string }> = {
  success: { bg: colors.greenBg, color: colors.green, border: "rgba(34,197,94,0.35)" },
  error: { bg: colors.redBg, color: colors.red, border: "rgba(239,68,68,0.35)" },
};

/** Toda mensagem do sistema usa este componente — nunca alert() do navegador (10.19). */
export function Toast({ toast }: ToastProps) {
  if (!toast) return null;
  const palette = PALETTE[toast.type];

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: colors.card,
        border: `1px solid ${palette.border}`,
        borderRadius: radius - 4,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        color: colors.textPrimary,
        fontSize: 13.5,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: palette.color, flexShrink: 0 }} />
      {toast.message}
    </div>
  );
}
