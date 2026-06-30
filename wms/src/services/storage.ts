import type { Carrier, Pallet, Stage } from "../types";

/**
 * Camada de persistência. NUNCA utiliza LocalStorage (Regra 8 / AI_RULES) —
 * usa o armazenamento chave/valor persistente do ambiente (window.storage).
 *
 * Isolar o acesso aqui, atrás de funções tipadas por entidade, é o que
 * permite trocar o backend no futuro (ex: API REST contra um banco
 * relacional real, conforme Capítulo 05 do SRS) alterando apenas este
 * arquivo — nenhum componente ou hook precisa saber como os dados são
 * armazenados.
 */
const KEYS = {
  stages: "wms:stages",
  carriers: "wms:carriers",
  pallets: "wms:pallets",
} as const;

async function loadKey<T>(key: string, fallback: T): Promise<T> {
  try {
    const res = await window.storage.get(key, false);
    return res ? (JSON.parse(res.value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function saveKey<T>(key: string, value: T): Promise<void> {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("Falha ao salvar", key, e);
  }
}

export const wmsStorage = {
  loadAll: async (): Promise<{ stages: Stage[]; carriers: Carrier[]; pallets: Pallet[] }> => {
    const [stages, carriers, pallets] = await Promise.all([
      loadKey<Stage[]>(KEYS.stages, []),
      loadKey<Carrier[]>(KEYS.carriers, []),
      loadKey<Pallet[]>(KEYS.pallets, []),
    ]);
    return { stages, carriers, pallets };
  },
  saveStages: (stages: Stage[]) => saveKey(KEYS.stages, stages),
  saveCarriers: (carriers: Carrier[]) => saveKey(KEYS.carriers, carriers),
  savePallets: (pallets: Pallet[]) => saveKey(KEYS.pallets, pallets),
};
