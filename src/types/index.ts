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
