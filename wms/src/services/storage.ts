import { createClient } from "@supabase/supabase-js";
import type { Carrier, Pallet, Stage } from "../types";

/**
 * Camada de persistência usando Supabase.
 *
 * Conforme arquitetura do projeto, toda a lógica de persistência fica
 * isolada aqui. Os componentes e hooks nunca acessam o banco diretamente,
 * apenas através das funções exportadas deste módulo.
 *
 * Mapeamento de campos snake_case (DB) para camelCase (TS):
 * - stage_id → stageId
 * - carrier_id → carrierId
 * - created_at → createdAt
 * - updated_at → updatedAt
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables not configured");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ---------- Row types from database ---------- */

interface StageRow {
  id: string;
  name: string;
  streets: number;
  positions: number;
  created_at: string;
}

interface CarrierRow {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

interface PalletRow {
  id: string;
  stage_id: string;
  carrier_id: string;
  street: number;
  position: number;
  tro: string;
  shipment: string;
  created_at: string;
  updated_at: string;
}

/* ---------- Mappers ---------- */

function mapStage(row: StageRow): Stage {
  return {
    id: row.id,
    name: row.name,
    streets: row.streets,
    positions: row.positions,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapCarrier(row: CarrierRow): Carrier {
  return {
    id: row.id,
    name: row.name,
    active: row.active,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapPallet(row: PalletRow): Pallet {
  return {
    id: row.id,
    stageId: row.stage_id,
    carrierId: row.carrier_id,
    street: row.street,
    position: row.position,
    tro: row.tro,
    shipment: row.shipment || "",
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

/* ---------- Storage API ---------- */

export const wmsStorage = {
  loadAll: async (): Promise<{ stages: Stage[]; carriers: Carrier[]; pallets: Pallet[] }> => {
    const [stagesRes, carriersRes, palletsRes] = await Promise.all([
      supabase.from("stages").select("*").order("name"),
      supabase.from("carriers").select("*").order("name"),
      supabase.from("pallets").select("*"),
    ]);

    if (stagesRes.error) throw stagesRes.error;
    if (carriersRes.error) throw carriersRes.error;
    if (palletsRes.error) throw palletsRes.error;

    const stages = (stagesRes.data as StageRow[]).map(mapStage);
    const carriers = (carriersRes.data as CarrierRow[]).map(mapCarrier);
    const pallets = (palletsRes.data as PalletRow[]).map(mapPallet);

    return { stages, carriers, pallets };
  },

  saveStages: async (stages: Stage[]): Promise<void> => {
    // For stages, we handle individual upserts since the app manages the full list
    // First, get existing stages to determine what to insert/update/delete
    const { data: existing, error: fetchError } = await supabase
      .from("stages")
      .select("id");
    if (fetchError) throw fetchError;

    const existingIds = new Set((existing as { id: string }[]).map((r) => r.id));
    const newIds = new Set(stages.map((s) => s.id));

    // Delete stages not in the new list
    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("stages")
        .delete()
        .in("id", toDelete);
      if (deleteError) throw deleteError;
    }

    // Upsert all stages in the list
    for (const stage of stages) {
      const row = {
        id: stage.id,
        name: stage.name,
        streets: stage.streets,
        positions: stage.positions,
        created_at: new Date(stage.createdAt).toISOString(),
      };
      const { error } = await supabase.from("stages").upsert(row);
      if (error) throw error;
    }
  },

  saveCarriers: async (carriers: Carrier[]): Promise<void> => {
    const { data: existing, error: fetchError } = await supabase
      .from("carriers")
      .select("id");
    if (fetchError) throw fetchError;

    const existingIds = new Set((existing as { id: string }[]).map((r) => r.id));
    const newIds = new Set(carriers.map((c) => c.id));

    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("carriers")
        .delete()
        .in("id", toDelete);
      if (deleteError) throw deleteError;
    }

    for (const carrier of carriers) {
      const row = {
        id: carrier.id,
        name: carrier.name,
        active: carrier.active,
        created_at: new Date(carrier.createdAt).toISOString(),
      };
      const { error } = await supabase.from("carriers").upsert(row);
      if (error) throw error;
    }
  },

  savePallets: async (pallets: Pallet[]): Promise<void> => {
    const { data: existing, error: fetchError } = await supabase
      .from("pallets")
      .select("id");
    if (fetchError) throw fetchError;

    const existingIds = new Set((existing as { id: string }[]).map((r) => r.id));
    const newIds = new Set(pallets.map((p) => p.id));

    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("pallets")
        .delete()
        .in("id", toDelete);
      if (deleteError) throw deleteError;
    }

    for (const pallet of pallets) {
      const row = {
        id: pallet.id,
        stage_id: pallet.stageId,
        carrier_id: pallet.carrierId,
        street: pallet.street,
        position: pallet.position,
        tro: pallet.tro,
        shipment: pallet.shipment,
        created_at: new Date(pallet.createdAt).toISOString(),
        updated_at: new Date(pallet.updatedAt).toISOString(),
      };
      const { error } = await supabase.from("pallets").upsert(row);
      if (error) throw error;
    }
  },
};
