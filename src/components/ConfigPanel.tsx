import { useState } from "react";
import { Map as MapIcon, Plus, Trash2, Truck } from "lucide-react";
import { Button, Field, Modal, TextInput } from "./ui";
import { colors, radius, space } from "../styles/tokens";
import type { Carrier, Stage } from "../types";

interface ConfigPanelProps {
  stages: Stage[];
  carriers: Carrier[];
  onClose: () => void;
  onCreateStage: (data: { name: string; streets: number; positions: number }) => void;
  onDeleteStage: (id: string) => void;
  onCreateCarrier: (name: string) => void;
  onDeleteCarrier: (id: string) => void;
}

/**
 * Painel de configuração — versão enxuta (Cap. 10.14-10.16) para
 * bootstrap de Stages/Transportadoras. As validações de negócio (nome
 * duplicado, exclusão bloqueada por vínculo) agora vivem em useWmsData,
 * então este componente é puramente apresentacional.
 */
export function ConfigPanel({ stages, carriers, onClose, onCreateStage, onDeleteStage, onCreateCarrier, onDeleteCarrier }: ConfigPanelProps) {
  const [tab, setTab] = useState<"stages" | "carriers">("stages");
  const [stageName, setStageName] = useState("");
  const [streets, setStreets] = useState(5);
  const [positions, setPositions] = useState(7);
  const [carrierName, setCarrierName] = useState("");

  return (
    <Modal title="Configuração" description="Cadastro rápido de Stages e Transportadoras." onClose={onClose} width={560}>
      <div style={{ display: "flex", gap: 8, marginBottom: space.inner }}>
        <Button variant={tab === "stages" ? "primary" : "secondary"} icon={MapIcon} onClick={() => setTab("stages")}>
          Stages
        </Button>
        <Button variant={tab === "carriers" ? "primary" : "secondary"} icon={Truck} onClick={() => setTab("carriers")}>
          Transportadoras
        </Button>
      </div>

      {tab === "stages" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: space.inner }}>
            <Field label="Nome" required>
              <TextInput value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="Expedição A" />
            </Field>
            <Field label="Ruas" required>
              <TextInput type="number" min={1} value={streets} onChange={(e) => setStreets(Math.max(1, Number(e.target.value) || 1))} />
            </Field>
            <Field label="Posições" required>
              <TextInput type="number" min={1} value={positions} onChange={(e) => setPositions(Math.max(1, Number(e.target.value) || 1))} />
            </Field>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              if (!stageName.trim()) return;
              onCreateStage({ name: stageName.trim(), streets, positions });
              setStageName("");
              setStreets(5);
              setPositions(7);
            }}
          >
            Criar Stage
          </Button>

          <div style={{ marginTop: space.card, display: "flex", flexDirection: "column", gap: 8 }}>
            {stages.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius - 4,
                  padding: "10px 14px",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: colors.textPrimary }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>
                    {s.streets} ruas × {s.positions} posições
                  </div>
                </div>
                <Button variant="danger" icon={Trash2} onClick={() => onDeleteStage(s.id)}>
                  Excluir
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "carriers" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: space.inner, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Field label="Nome da transportadora" required>
                <TextInput value={carrierName} onChange={(e) => setCarrierName(e.target.value)} placeholder="Bertolini" />
              </Field>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              style={{ marginBottom: space.field }}
              onClick={() => {
                const name = carrierName.trim();
                if (!name) return;
                onCreateCarrier(name);
                setCarrierName("");
              }}
            >
              Adicionar
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {carriers.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius - 4,
                  padding: "10px 14px",
                }}
              >
                <div style={{ fontSize: 14, color: colors.textPrimary }}>{c.name}</div>
                <Button variant="danger" icon={Trash2} onClick={() => onDeleteCarrier(c.id)}>
                  Excluir
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
