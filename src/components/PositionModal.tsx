import { useState } from "react";
import { CircleAlert as AlertCircle, Check, Pencil, Trash2, Truck, Package } from "lucide-react";
import { Button, Field, Modal, Row, TextInput } from "./ui";
import { CarrierCombobox } from "./CarrierCombobox";
import { colors, inputStyle, space } from "../styles/tokens";
import { formatTRO, normalizeTRODigits } from "../utils/tro";
import type { Carrier, Pallet, Stage } from "../types";

interface PositionModalProps {
  stage: Stage;
  street: number;
  position: number;
  pallet?: Pallet;
  carriers: Carrier[];
  onClose: () => void;
  onSave: (input: { carrierId: string; tro: string; shipment: string }) => void;
  onRelease: (pallet: Pallet) => void;
}

/** Modal único de posição — cobre cadastro (3.9), visualização e liberação (3.12). */
export function PositionModal({ stage, street, position, pallet, carriers, onClose, onSave, onRelease }: PositionModalProps) {
  const isOccupied = !!pallet;
  const [editing, setEditing] = useState(!isOccupied);
  const [carrierId, setCarrierId] = useState(pallet?.carrierId || "");
  const [troDigits, setTroDigits] = useState(pallet ? normalizeTRODigits(pallet.tro) : "");
  const [shipment, setShipment] = useState(pallet?.shipment || "");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!carrierId) {
      setError("Selecione a transportadora.");
      return;
    }
    if (!troDigits) {
      setError("Informe o TRO.");
      return;
    }
    setError("");
    onSave({ carrierId, tro: formatTRO(troDigits), shipment: shipment.trim() });
  };

  return (
    <Modal
      title={isOccupied && !editing ? `Stage ${stage.name} · Rua ${street} · Posição ${position}` : isOccupied ? "Editar palete" : "Cadastrar palete"}
      description={isOccupied && !editing ? "Detalhes do palete nesta posição." : `Rua ${street} · Posição ${position}`}
      onClose={onClose}
      footer={
        editing ? (
          <>
            <Button variant="secondary" onClick={() => (isOccupied ? setEditing(false) : onClose())}>
              Cancelar
            </Button>
            <Button variant="primary" icon={Check} onClick={handleSave}>
              Salvar
            </Button>
          </>
        ) : (
          <>
            <Button variant="danger" icon={Trash2} onClick={() => pallet && onRelease(pallet)}>
              Liberar posição
            </Button>
            <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>
              Editar
            </Button>
          </>
        )
      }
    >
      {!editing && pallet ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Row label="Transportadora" value={carriers.find((c) => c.id === pallet.carrierId)?.name || "—"} icon={Truck} />
          <Row label="TRO" value={pallet.tro} icon={Package} />
          <Row label="Remessa" value={pallet.shipment || "—"} />
        </div>
      ) : (
        <div>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: colors.redBg,
                border: "1px solid rgba(239,68,68,0.35)",
                color: colors.red,
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                marginBottom: space.inner,
              }}
            >
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <Field label="Transportadora" required>
            <CarrierCombobox carriers={carriers} value={carrierId} onChange={setCarrierId} />
          </Field>
          <Field label="TRO" required>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: colors.textMuted, pointerEvents: "none" }}>
                TRO-
              </span>
              <input
                value={troDigits}
                onChange={(e) => setTroDigits(e.target.value.replace(/\D/g, ""))}
                placeholder="000123"
                inputMode="numeric"
                style={{ ...inputStyle, paddingLeft: 44 }}
              />
            </div>
          </Field>
          <Field label="Remessa">
            <TextInput value={shipment} onChange={(e) => setShipment(e.target.value)} placeholder="Opcional" />
          </Field>
        </div>
      )}
    </Modal>
  );
}
