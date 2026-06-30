import type React from "react";
import type { LucideIcon } from "lucide-react";
import { colors } from "../../styles/tokens";

interface RowProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}

/** Linha rótulo/valor reutilizável — usada em qualquer tela de detalhe. */
export function Row({ label, value, icon: Icon }: RowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 10,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: colors.textSecondary }}>
        {Icon && <Icon size={14} style={{ opacity: 0.7 }} />} {label}
      </span>
      <span style={{ fontSize: 14, color: colors.textPrimary, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
