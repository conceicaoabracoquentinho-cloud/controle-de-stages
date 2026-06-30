import type { Carrier, Pallet, SearchResultGroup, SearchResultRow, SearchType, Stage } from "../types";
import { troSearchKey } from "../utils/tro";

interface SearchArgs {
  type: SearchType;
  query: string;
  pallets: Pallet[];
  stages: Stage[];
  carriers: Carrier[];
}

/**
 * Pesquisa inteligente — Capítulo 02.5 / 06 / 12.4 do SRS.
 * Sempre pesquisa em TODOS os Stages (nunca apenas no Stage aberto).
 * Pesquisa por TRO: correspondência exata após normalização completa
 * (números, maiúsculas/minúsculas, espaços, prefixo, zeros à esquerda).
 * Pesquisa por Transportadora: parte do nome, case-insensitive, sempre
 * sobre a lista cadastrada (nunca digitação livre).
 */
export function searchPallets({ type, query, pallets, stages, carriers }: SearchArgs): SearchResultRow[] {
  const q = (query || "").trim();
  if (!q) return [];

  const stageById = new Map(stages.map((s) => [s.id, s]));
  const carrierById = new Map(carriers.map((c) => [c.id, c]));

  let matched: Pallet[];

  if (type === "tro") {
    const qKey = troSearchKey(q);
    if (!qKey) return [];
    matched = pallets.filter((p) => troSearchKey(p.tro) === qKey);
  } else {
    const qName = q.toLowerCase().replace(/\s+/g, " ").trim();
    const matchingCarrierIds = new Set(
      carriers.filter((c) => c.name.toLowerCase().includes(qName)).map((c) => c.id)
    );
    matched = pallets.filter((p) => matchingCarrierIds.has(p.carrierId));
  }

  const rows: SearchResultRow[] = [];
  for (const pallet of matched) {
    const stage = stageById.get(pallet.stageId);
    if (!stage) continue;
    rows.push({ pallet, stage, carrier: carrierById.get(pallet.carrierId) });
  }

  // Ordenação obrigatória: Stage → Rua → Posição (Cap. 2.6 / 6.6).
  return rows.sort((a, b) => {
    if (a.stage.name !== b.stage.name) return a.stage.name.localeCompare(b.stage.name);
    if (a.pallet.street !== b.pallet.street) return a.pallet.street - b.pallet.street;
    return a.pallet.position - b.pallet.position;
  });
}

/** Agrupa resultados já ordenados por Stage, preservando a ordem de chegada. */
export function groupResultsByStage(results: SearchResultRow[]): SearchResultGroup[] {
  const groups: SearchResultGroup[] = [];
  const indexByStage = new Map<string, number>();

  for (const row of results) {
    let idx = indexByStage.get(row.stage.id);
    if (idx === undefined) {
      idx = groups.length;
      indexByStage.set(row.stage.id, idx);
      groups.push({ stage: row.stage, items: [] });
    }
    groups[idx].items.push(row);
  }
  return groups;
}
