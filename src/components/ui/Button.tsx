import type React from "react";
import type { LucideIcon } from "lucide-react";
import { colors, radius, space } from "../../styles/tokens";

export type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  style?: React.CSSProperties;
}

const PALETTES: Record<ButtonVariant, { bg: string; color: string; border: string }> = {
  primary: { bg: colors.blue, color: "#fff", border: colors.blue },
  secondary: { bg: "transparent", color: colors.textPrimary, border: colors.borderStrong },
  danger: { bg: "transparent", color: colors.red, border: "rgba(239,68,68,0.4)" },
  success: { bg: colors.green, color: "#0c2415", border: colors.green },
  ghost: { bg: "transparent", color: colors.textSecondary, border: "transparent" },
};

/** Botão padronizado do Design System — hierarquia visual única (7.9/7.16). */
export function Button({ children, variant = "secondary", icon: Icon, onClick, disabled, type = "button", style }: ButtonProps) {
  const palette = PALETTES[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: space.iconText,
        padding: "10px 16px",
        borderRadius: radius - 4,
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "filter .15s ease, transform .1s ease",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.filter = "brightness(1.12)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}
