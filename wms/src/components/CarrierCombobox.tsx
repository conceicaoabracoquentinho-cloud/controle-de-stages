import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, Truck } from "lucide-react";
import { colors, inputStyle, radius } from "../styles/tokens";
import type { Carrier } from "../types";

interface CarrierComboboxProps {
  carriers: Carrier[];
  value: string;
  onChange: (carrierId: string) => void;
  placeholder?: string;
}

/**
 * Combobox pesquisável — exigido pelo Design System (7.11) para nunca
 * permitir digitação livre da Transportadora (Regra Imutável, Cap. 9.4).
 */
export function CarrierCombobox({ carriers, value, onChange, placeholder = "Selecionar transportadora" }: CarrierComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = carriers.find((c) => c.id === value);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = carriers
    .filter((c) => c.active !== false)
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          color: selected ? colors.textPrimary : colors.textMuted,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Truck size={14} style={{ opacity: 0.7 }} />
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 40,
            background: colors.card,
            border: `1px solid ${colors.borderStrong}`,
            borderRadius: radius - 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 8, borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: colors.bgElevated, borderRadius: 8, padding: "6px 10px" }}>
              <Search size={13} style={{ color: colors.textMuted }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar..."
                style={{ background: "transparent", border: "none", outline: "none", color: colors.textPrimary, fontSize: 13, width: "100%" }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: 12, fontSize: 13, color: colors.textMuted }}>Nenhuma transportadora encontrada.</div>
            )}
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  padding: "10px 12px",
                  fontSize: 13.5,
                  cursor: "pointer",
                  background: c.id === value ? colors.cardHover : "transparent",
                  color: colors.textPrimary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.cardHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = c.id === value ? colors.cardHover : "transparent")}
              >
                {c.name}
                {c.id === value && <Check size={14} style={{ color: colors.blue }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
