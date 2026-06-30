import { useCallback, useEffect, useRef, useState } from "react";
import type { HighlightSet } from "../types";

/**
 * Encapsula a regra "Visualizar no mapa": destaca as posições encontradas
 * em azul sem alterar o estado original (Livre/Ocupado), centraliza a
 * visualização e remove o destaque automaticamente após alguns segundos
 * (Cap. 6.12/6.13). Extraído do componente de página para reuso (ex: um
 * futuro botão de destaque no Dashboard pode usar o mesmo hook).
 */
export function useMapHighlight(durationMs = 3200) {
  const [highlighted, setHighlighted] = useState<HighlightSet | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highlightOnStage = useCallback(
    (stageId: string, positionKeys: string[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setHighlighted(new Set(positionKeys.map((k) => `${stageId}:${k}`)));
      timerRef.current = setTimeout(() => setHighlighted(null), durationMs);
    },
    [durationMs]
  );

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { highlighted, highlightOnStage };
}

/** Centraliza a primeira posição destacada na tela assim que o destaque muda. */
export function useScrollToHighlight(activeStageId: string | null, highlighted: HighlightSet | null) {
  useEffect(() => {
    if (!highlighted || highlighted.size === 0 || !activeStageId) return;
    const [firstEntry] = Array.from(highlighted);
    const positionKey = firstEntry.split(":")[1];
    const el = document.getElementById(`pos-${activeStageId}-${positionKey}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, [highlighted, activeStageId]);
}
