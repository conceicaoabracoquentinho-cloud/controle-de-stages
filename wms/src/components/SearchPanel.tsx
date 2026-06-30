import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "./ui";
import { Map as MapIcon } from "lucide-react";
import { colors, inputStyle, radius, space } from "../styles/tokens";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { groupResultsByStage, searchPallets } from "../services/search";
import type { Carrier, Pallet, SearchType, Stage } from "../types";

interface SearchPanelProps {
  stages: Stage[];
  carriers: Carrier[];
  pallets: Pallet[];
  onViewOnMap: (stageId: string, positionKeys: string[]) => void;
}

/**
 * Painel de pesquisa — segunda funcionalidade mais importante do sistema
 * (12.4). Sempre pesquisa em todos os Stages. A lógica de busca/agrupamento
 * é pura (services/search.ts); este componente cuida só de apresentação e
 * debounce de entrada (06.14: 300–500ms).
 */
export function SearchPanel({ stages, carriers, pallets, onViewOnMap }: SearchPanelProps) {
  const [type, setType] = useState<SearchType>("tro");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);

  const results = useMemo(
    () => searchPallets({ type, query: debouncedQuery, pallets, stages, carriers }),
    [type, debouncedQuery, pallets, stages, carriers]
  );
  const groups = useMemo(() => groupResultsByStage(results), [results]);
  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: space.inner }}>Pesquisa</div>

      {/* Alternância TRO / Transportadora */}
      <div style={{ display: "flex", gap: 6, marginBottom: space.inner, background: colors.bgElevated, borderRadius: radius - 4, padding: 4 }}>
        {([
          { key: "tro", label: "TRO" },
          { key: "carrier", label: "Transportadora" },
        ] as { key: SearchType; label: string }[]).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setType(opt.key)}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: radius - 6,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              background: type === opt.key ? colors.card : "transparent",
              color: type === opt.key ? colors.textPrimary : colors.textMuted,
              boxShadow: type === opt.key ? `0 0 0 1px ${colors.border}` : "none",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Campo de pesquisa + Limpar */}
      <div style={{ display: "flex", gap: 8, marginBottom: space.inner }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.textMuted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={type === "tro" ? "Pesquisar por TRO..." : "Pesquisar por transportadora..."}
            inputMode={type === "tro" ? "numeric" : "text"}
            style={{ ...inputStyle, paddingLeft: 34 }}
          />
        </div>
        <Button variant="ghost" onClick={() => setQuery("")} disabled={!query}>
          Limpar
        </Button>
      </div>

      {/* Resultados */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingRight: 2 }}>
        {!hasQuery && (
          <div style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.6, padding: "8px 2px" }}>
            Digite um TRO ou parte do nome de uma transportadora. A pesquisa sempre considera todos os Stages.
          </div>
        )}

        {hasQuery && groups.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 8px", color: colors.textMuted }}>
            <Search size={20} style={{ opacity: 0.4, marginBottom: 8 }} />
            <div style={{ fontSize: 13 }}>Nenhum resultado encontrado.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Verifique se a TRO ou Transportadora foi informada corretamente.</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {groups.map((group) => (
            <div key={group.stage.id} style={{ background: colors.bgElevated, border: `1px solid ${colors.border}`, borderRadius: radius - 4, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MapIcon size={14} style={{ color: colors.blue }} />
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: colors.textPrimary }}>{group.stage.name}</span>
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    color: colors.textMuted,
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 999,
                    padding: "2px 8px",
                  }}
                >
                  {group.items.length} {group.items.length === 1 ? "palete" : "paletes"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {group.items.map((r) => (
                  <div
                    key={r.pallet.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 12.5,
                      padding: "6px 8px",
                      borderRadius: 8,
                      background: colors.card,
                    }}
                  >
                    <span style={{ color: colors.textSecondary }}>
                      Rua {r.pallet.street} · Posição {r.pallet.position}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                      <span style={{ color: colors.textPrimary, fontWeight: 500 }}>{r.pallet.tro}</span>
                      <span style={{ color: colors.textMuted, fontSize: 11 }}>{r.carrier?.name || "—"}</span>
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant="secondary"
                icon={MapIcon}
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => onViewOnMap(group.stage.id, group.items.map((r) => `${r.pallet.street}-${r.pallet.position}`))}
              >
                Visualizar no mapa
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
