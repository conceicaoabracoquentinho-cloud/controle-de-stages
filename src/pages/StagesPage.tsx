import { useMemo, useState } from "react";
import { Map as MapIcon, Plus, RefreshCw, Settings } from "lucide-react";
import { Button, Toast } from "../components/ui";
import { StageMap } from "../components/StageMap";
import { SearchPanel } from "../components/SearchPanel";
import { ConfigPanel } from "../components/ConfigPanel";
import { PositionModal } from "../components/PositionModal";
import { useWmsData } from "../hooks/useWmsData";
import { useToast } from "../hooks/useToast";
import { useMapHighlight, useScrollToHighlight } from "../hooks/useMapHighlight";
import { colors, radius, space } from "../styles/tokens";
import type { Pallet, PositionSelection, Stage } from "../types";

/** Tela operacional principal — mapa (70%) + pesquisa (30%), Cap. 04.4/10.3. */
export function StagesPage() {
  const { toast, showToast } = useToast();
  const {
    loading,
    stages,
    carriers,
    pallets,
    lastSync,
    occupiedByStage,
    indicators,
    refresh,
    createStage,
    deleteStage,
    createCarrier,
    deleteCarrier,
    savePallet,
    releasePallet,
  } = useWmsData(showToast);

  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [posModal, setPosModal] = useState<PositionSelection | null>(null);
  const { highlighted, highlightOnStage } = useMapHighlight();

  // Garante um Stage ativo assim que os dados chegam, sem sobrescrever a escolha do usuário.
  const activeStage = useMemo<Stage | undefined>(() => {
    return stages.find((s) => s.id === activeStageId) ?? stages[0];
  }, [stages, activeStageId]);

  useScrollToHighlight(activeStage?.id ?? null, highlighted);

  const openPosition = (stage: Stage, street: number, position: number, pallet?: Pallet) => {
    setPosModal({ stage, street, position, pallet });
  };

  const handleSavePallet = async (input: { carrierId: string; tro: string; shipment: string }) => {
    if (!posModal) return;
    const ok = await savePallet(posModal, input);
    if (ok) setPosModal(null);
  };

  const handleReleasePosition = async (pallet: Pallet) => {
    await releasePallet(pallet);
    setPosModal(null);
  };

  const handleViewOnMap = (stageId: string, positionKeys: string[]) => {
    setActiveStageId(stageId);
    highlightOnStage(stageId, positionKeys);
  };

  if (loading) {
    return (
      <div style={{ background: colors.bg, minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
        <span style={{ color: colors.textSecondary, fontSize: 14 }}>Carregando...</span>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bg, minHeight: 600, fontFamily: "Inter, system-ui, sans-serif", color: colors.textPrimary }}>
      {/* Cabeçalho */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: colors.bgElevated,
          borderBottom: `1px solid ${colors.border}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.blueBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapIcon size={18} style={{ color: colors.blue }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.2 }}>Controle de Stages</div>
            <div style={{ fontSize: 11.5, color: colors.textMuted }}>Warehouse Management System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            {lastSync ? `Sincronizado às ${lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : ""}
          </span>
          <Button variant="ghost" icon={RefreshCw} onClick={refresh}>
            Atualizar
          </Button>
          <Button variant="secondary" icon={Settings} onClick={() => setConfigOpen(true)}>
            Configuração
          </Button>
        </div>
      </div>

      {/* Indicadores essenciais */}
      <div style={{ padding: "20px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: space.card }}>
        {[
          { label: "Total de posições", value: indicators.total },
          { label: "Posições livres", value: indicators.free, color: colors.green },
          { label: "Posições ocupadas", value: indicators.occupied, color: colors.red },
          { label: "Taxa de ocupação", value: `${indicators.rate}%`, color: colors.blue },
        ].map((card) => (
          <div key={card.label} style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: radius, padding: space.inner }}>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: card.color || colors.textPrimary }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Corpo: Stages + Mapa (70%) + Pesquisa (30%) */}
      <div style={{ padding: 24, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 600px", minWidth: 0 }}>
          {/* Abas dos Stages */}
          <div style={{ display: "flex", gap: 8, marginBottom: space.inner, overflowX: "auto", paddingBottom: 4 }}>
            {stages.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStageId(s.id)}
                style={{
                  padding: "9px 16px",
                  borderRadius: radius - 4,
                  whiteSpace: "nowrap",
                  border: `1px solid ${s.id === activeStage?.id ? colors.blue : colors.border}`,
                  background: s.id === activeStage?.id ? colors.blueBg : colors.card,
                  color: s.id === activeStage?.id ? colors.blue : colors.textSecondary,
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {s.name}
              </button>
            ))}
            {stages.length === 0 && <span style={{ fontSize: 13, color: colors.textMuted }}>Nenhum Stage cadastrado.</span>}
          </div>

          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: radius, padding: space.card }}>
            {activeStage ? (
              <StageMap
                stage={activeStage}
                occupied={occupiedByStage[activeStage.id] || {}}
                highlighted={highlighted}
                onPositionClick={openPosition}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "48px 0", color: colors.textMuted }}>
                <MapIcon size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
                <div style={{ fontSize: 14, marginBottom: 12 }}>Cadastre um Stage para começar.</div>
                <Button variant="primary" icon={Plus} onClick={() => setConfigOpen(true)}>
                  Criar Stage
                </Button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 12.5, color: colors.textSecondary }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: colors.green, display: "inline-block" }} /> Livre
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: colors.red, display: "inline-block" }} /> Ocupada
            </span>
          </div>
        </div>

        <div
          style={{
            flex: "1 1 280px",
            maxWidth: "min(340px, 100%)",
            width: "100%",
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: radius,
            padding: space.card,
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 220px)",
            minHeight: 320,
            boxSizing: "border-box",
          }}
        >
          <SearchPanel stages={stages} carriers={carriers} pallets={pallets} onViewOnMap={handleViewOnMap} />
        </div>
      </div>

      {configOpen && (
        <ConfigPanel
          stages={stages}
          carriers={carriers}
          onClose={() => setConfigOpen(false)}
          onCreateStage={createStage}
          onDeleteStage={deleteStage}
          onCreateCarrier={createCarrier}
          onDeleteCarrier={deleteCarrier}
        />
      )}

      {posModal && (
        <PositionModal
          stage={posModal.stage}
          street={posModal.street}
          position={posModal.position}
          pallet={posModal.pallet}
          carriers={carriers}
          onClose={() => setPosModal(null)}
          onSave={handleSavePallet}
          onRelease={handleReleasePosition}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
