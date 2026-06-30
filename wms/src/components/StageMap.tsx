import React, { memo } from "react";
import { Package } from "lucide-react";
import { colors } from "../styles/tokens";
import type { HighlightSet, OccupancyMap, Pallet, Stage } from "../types";

interface StageMapProps {
  stage: Stage;
  occupied: OccupancyMap;
  highlighted: HighlightSet | null;
  onPositionClick: (stage: Stage, street: number, position: number, pallet?: Pallet) => void;
}

/**
 * Mapa — coração do sistema (12.3). Gerado dinamicamente a partir da
 * configuração do Stage (nunca valores fixos). Colunas = Ruas, linhas =
 * Posições, sempre de cima para baixo (Regra Imutável, Cap. 9.4).
 *
 * `memo` evita recalcular o grid inteiro quando outros Stages/estado da
 * aplicação mudam e não afetam este Stage — só re-renderiza quando suas
 * próprias props (ocupação, destaque) realmente mudam (9.10 / Regra 5).
 */
function StageMapComponent({ stage, occupied, highlighted, onPositionClick }: StageMapProps) {
  const streets = Array.from({ length: stage.streets }, (_, i) => i + 1);
  const positions = Array.from({ length: stage.positions }, (_, i) => i + 1);

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "inline-block", minWidth: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `56px repeat(${streets.length}, 64px)`,
            gap: 10,
          }}
        >
          <div />
          {streets.map((s) => (
            <div key={s} style={{ textAlign: "center", fontSize: 11.5, color: colors.textMuted, fontWeight: 500 }}>
              Rua {s}
            </div>
          ))}

          {positions.map((p) => (
            <React.Fragment key={p}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 11.5, color: colors.textMuted, paddingRight: 4 }}>
                Pos {p}
              </div>
              {streets.map((s) => {
                const key = `${s}-${p}`;
                const pallet = occupied[key];
                const isHi = highlighted?.has(`${stage.id}:${key}`) ?? false;
                const palette = pallet
                  ? { bg: colors.redBg, border: "rgba(239,68,68,0.4)", dot: colors.red }
                  : { bg: colors.greenBg, border: "rgba(34,197,94,0.4)", dot: colors.green };

                return (
                  <button
                    key={key}
                    id={`pos-${stage.id}-${s}-${p}`}
                    onClick={() => onPositionClick(stage, s, p, pallet)}
                    title={pallet ? pallet.tro : "Posição livre"}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: palette.bg,
                      border: `2px solid ${isHi ? colors.blue : palette.border}`,
                      boxShadow: isHi ? `0 0 0 4px ${colors.blueBg}` : "0 1px 3px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform .12s ease, box-shadow .2s ease",
                      color: palette.dot,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {pallet ? <Package size={20} /> : null}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export const StageMap = memo(StageMapComponent);
