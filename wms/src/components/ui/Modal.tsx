import type React from "react";
import { X } from "lucide-react";
import { colors, radius, space } from "../../styles/tokens";

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

/** Estrutura única de modal — título, descrição, corpo, rodapé (7.12). */
export function Modal({ title, description, onClose, children, footer, width = 440 }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: radius,
          width: "100%",
          maxWidth: width,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: space.card, paddingBottom: space.inner, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 500, color: colors.textPrimary }}>{title}</h3>
              {description && <p style={{ margin: "6px 0 0", fontSize: 13, color: colors.textSecondary }}>{description}</p>}
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", padding: 4 }}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div style={{ padding: space.card, overflowY: "auto" }}>{children}</div>
        {footer && (
          <div
            style={{
              padding: space.card,
              paddingTop: space.inner,
              borderTop: `1px solid ${colors.border}`,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
