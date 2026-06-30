/**
 * Tipos de domínio do Controle de Stages WMS.
 * Mantidos centralizados para que qualquer novo módulo (Dashboard,
 * Histórico, Usuários, etc.) reutilize exatamente o mesmo contrato de dados.
 */

export interface Stage {
  id: string;
  name: string;
  streets: number;
  positions: number;
  createdAt: number;
}

export interface Carrier {
  id: string;
  name: string;
  active: boolean;
  createdAt: number;
}

export interface Pallet {
  id: string;
  stageId: string;
  carrierId: string;
  street: number;
  position: number;
  tro: string;
  shipment: string;
  createdAt: number;
  updatedAt: number;
}

export type SearchType = "tro" | "carrier";

export interface SearchResultRow {
  pallet: Pallet;
  stage: Stage;
  carrier?: Carrier;
}

export interface SearchResultGroup {
  stage: Stage;
  items: SearchResultRow[];
}

export interface ToastState {
  message: string;
  type: "success" | "error";
}

export interface PositionSelection {
  stage: Stage;
  street: number;
  position: number;
  pallet?: Pallet;
}

/** chave = `${street}-${position}` */
export type OccupancyMap = Record<string, Pallet>;

/** chave = `${stageId}:${street}-${position}` */
export type HighlightSet = Set<string>;

/**
 * Contrato mínimo de armazenamento persistente que o app utiliza.
 * Implementado hoje por `window.storage` (ver services/storage.ts).
 * Abstrair via interface permite trocar o backend (ex: API REST/Bolt
 * Database real) no futuro sem tocar nos componentes ou hooks.
 */
export interface KeyValueStore {
  get(key: string, shared?: boolean): Promise<{ key: string; value: string; shared: boolean } | null>;
  set(key: string, value: string, shared?: boolean): Promise<{ key: string; value: string; shared: boolean } | null>;
  delete(key: string, shared?: boolean): Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
  list(prefix?: string, shared?: boolean): Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
}

declare global {
  interface Window {
    storage: KeyValueStore;
  }
}
