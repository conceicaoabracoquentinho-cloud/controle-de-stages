import type React from "react";

/**
 * Design tokens — derivados do Capítulo 07 (Design System) do SRS.
 * Único ponto de verdade visual: qualquer componente novo deve importar
 * destes tokens em vez de declarar cores/espaçamentos soltos.
 */
export const colors = {
  bg: "#16181c",
  bgElevated: "#1b1e23",
  card: "#1e2127",
  cardHover: "#23262d",
  border: "#2b2e35",
  borderStrong: "#383c45",
  textPrimary: "#f2f2f0",
  textSecondary: "#a6a9b0",
  textMuted: "#6b6e76",
  green: "#22c55e",
  greenBg: "rgba(34,197,94,0.12)",
  red: "#ef4444",
  redBg: "rgba(239,68,68,0.12)",
  blue: "#3b82f6",
  blueBg: "rgba(59,130,246,0.14)",
  orange: "#f59e0b",
  orangeBg: "rgba(245,158,11,0.12)",
} as const;

export const radius = 12;

export const space = { card: 24, inner: 16, field: 12, iconText: 8 } as const;

export const inputStyle: React.CSSProperties = {
  background: colors.bgElevated,
  border: `1px solid ${colors.border}`,
  borderRadius: radius - 4,
  padding: "10px 12px",
  color: colors.textPrimary,
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
