import { useCallback, useEffect, useMemo, useState } from "react";
import type { Carrier, OccupancyMap, Pallet, Stage } from "../types";
import { wmsStorage } from "../services/storage";
import { uid } from "../utils/uid";

interface SavePalletInput {
  carrierId: string;
  tro: string;
  shipment: string;
}

interface SavePalletTarget {
  stage: Stage;
  street: number;
  position: number;
  pallet?: Pallet;
}

type Notify = (message: string, type?: "success" | "error") => void;

/**
 * Hook central de dados do Controle de Stages.
 *
 * Concentra TODAS as regras de negócio de leitura/escrita (Capítulos 03/05
 * do SRS) que antes viviam espalhadas dentro do componente App. Isso:
 *  - separa estado/regra de negócio de apresentação (SRP);
 *  - permite que futuras telas (Dashboard, Histórico, API) reutilizem
 *    exatamente as mesmas operações sem duplicar lógica;
 *  - facilita testes unitários da camada de domínio, isolada do React DOM.
 */
export function useWmsData(notify: Notify) {
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<Stage[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const data = await wmsStorage.loadAll();
    setStages(data.stages);
    setCarriers(data.carriers);
    setPallets(data.pallets);
    setLastSync(new Date());
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ---------- Derivados (memoizados — atualizam só quando a fonte muda) ---------- */

  const occupiedByStage = useMemo(() => {
    const map: Record<string, OccupancyMap> = {};
    for (const p of pallets) {
      if (!map[p.stageId]) map[p.stageId] = {};
      map[p.stageId][`${p.street}-${p.position}`] = p;
    }
    return map;
  }, [pallets]);

  const indicators = useMemo(() => {
    const total = stages.reduce((sum, s) => sum + s.streets * s.positions, 0);
    const occupied = pallets.length;
    return { total, occupied, free: total - occupied, rate: total ? Math.round((occupied / total) * 100) : 0 };
  }, [stages, pallets]);

  /* ---------- Stages (Cap. 3.13 / 5.4) ---------- */

  const createStage = useCallback(
    async (data: { name: string; streets: number; positions: number }) => {
      const nameTaken = stages.some((s) => s.name.toLowerCase() === data.name.toLowerCase());
      if (nameTaken) {
        notify("Já existe um Stage com esse nome.", "error");
        return null;
      }
      const stage: Stage = { id: uid(), ...data, createdAt: Date.now() };
      const next = [...stages, stage];
      setStages(next);
      await wmsStorage.saveStages(next);
      notify("Stage criado.");
      return stage;
    },
    [stages, notify]
  );

  const deleteStage = useCallback(
    async (id: string) => {
      const hasPallets = pallets.some((p) => p.stageId === id);
      if (hasPallets) {
        notify("Não é possível excluir um Stage que possua paletes cadastrados.", "error");
        return false;
      }
      const next = stages.filter((s) => s.id !== id);
      setStages(next);
      await wmsStorage.saveStages(next);
      notify("Stage excluído.");
      return true;
    },
    [stages, pallets, notify]
  );

  /* ---------- Transportadoras (Cap. 3.10 / 5.5) ---------- */

  const createCarrier = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const exists = carriers.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) {
        notify("Já existe uma transportadora com esse nome.", "error");
        return null;
      }
      const carrier: Carrier = { id: uid(), name: trimmed, active: true, createdAt: Date.now() };
      const next = [...carriers, carrier];
      setCarriers(next);
      await wmsStorage.saveCarriers(next);
      notify("Transportadora criada.");
      return carrier;
    },
    [carriers, notify]
  );

  const deleteCarrier = useCallback(
    async (id: string) => {
      const inUse = pallets.some((p) => p.carrierId === id);
      if (inUse) {
        notify("Não é possível excluir uma transportadora com paletes vinculados.", "error");
        return false;
      }
      const next = carriers.filter((c) => c.id !== id);
      setCarriers(next);
      await wmsStorage.saveCarriers(next);
      notify("Transportadora excluída.");
      return true;
    },
    [carriers, pallets, notify]
  );

  /* ---------- Paletes (Cap. 3.8 / 3.9 / 3.12) ---------- */

  const savePallet = useCallback(
    async (target: SavePalletTarget, input: SavePalletInput) => {
      const { stage, street, position, pallet } = target;

      if (pallet) {
        const next = pallets.map((p) =>
          p.id === pallet.id ? { ...p, ...input, updatedAt: Date.now() } : p
        );
        setPallets(next);
        await wmsStorage.savePallets(next);
        notify("Informações atualizadas.");
        return true;
      }

      // Regra 3.8: nunca permitir dois registros na mesma Stage+Rua+Posição.
      const conflict = pallets.some(
        (p) => p.stageId === stage.id && p.street === street && p.position === position
      );
      if (conflict) {
        notify("Esta posição já está ocupada.", "error");
        return false;
      }

      const record: Pallet = {
        id: uid(),
        stageId: stage.id,
        street,
        position,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...input,
      };
      const next = [...pallets, record];
      setPallets(next);
      await wmsStorage.savePallets(next);
      notify("Palete cadastrado com sucesso.");
      return true;
    },
    [pallets, notify]
  );

  const releasePallet = useCallback(
    async (pallet: Pallet) => {
      const next = pallets.filter((p) => p.id !== pallet.id);
      setPallets(next);
      await wmsStorage.savePallets(next);
      notify("Posição liberada.");
    },
    [pallets, notify]
  );

  return {
    loading,
    stages,
    carriers,
    pallets,
    lastSync,
    occupiedByStage,
    indicators,
    refresh: loadAll,
    createStage,
    deleteStage,
    createCarrier,
    deleteCarrier,
    savePallet,
    releasePallet,
  };
}
