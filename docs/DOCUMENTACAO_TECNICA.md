# Documentação Técnica — Controle de Stages WMS

## Visão geral

O **Controle de Stages** é um sistema de Warehouse Management System (WMS) que controla a ocupação de posições em áreas de armazenagem (Stages). Cada Stage possui ruas e posições organizadas em grade. O sistema permite cadastrar paletes em posições específicas, pesquisá-los por TRO ou transportadora, e visualizar a ocupação em um mapa visual.

### Objetivo do sistema

Controlar a entrada, permanência e saída de paletes em stages de armazenagem, garantindo que cada posição abrigue no máximo um palete, fornecendo pesquisa rápida e visualização clara do estado do armazém.

### Fluxo operacional

1. **Configuração inicial**: cadastrar Stages (nome, ruas, posições) e Transportadoras.
2. **Cadastro de palete**: clicar em uma posição livre no mapa, informar transportadora + TRO + remessa.
3. **Pesquisa**: buscar paletes por TRO ou transportadora em todos os Stages.
4. **Visualização no mapa**: a partir da pesquisa, destacar posições no mapa.
5. **Liberação**: remover palete de uma posição (libera para novo uso).
6. **Edição**: alterar transportadora/TRO/remessa de um palete existente.

### Arquitetura

Arquitetura em camadas com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────┐
│  Camada de Apresentação (components / pages)    │
│  StagesPage, StageMap, SearchPanel, etc.        │
├─────────────────────────────────────────────────┤
│  Camada de Estado/Regras (hooks)                │
│  useWmsData, useToast, useMapHighlight, etc.   │
├─────────────────────────────────────────────────┤
│  Camada de Serviços (services)                   │
│  storage.ts (persistência), search.ts (busca)  │
├─────────────────────────────────────────────────┤
│  Camada de Dados (Supabase / PostgreSQL)         │
│  tables: stages, carriers, pallets             │
└─────────────────────────────────────────────────┘
```

Princípios:
- **Single Responsibility**: cada módulo tem uma responsabilidade única.
- **Separação apresentação/regra**: componentes nunca acessam o banco diretamente.
- **Reutilização**: hooks e services podem ser consumidos por futuras telas (Dashboard, Histórico).

### Tecnologias utilizadas

| Tecnologia | Versão | Função |
|---|---|---|
| React | 18.3 | Framework de UI |
| TypeScript | 5.5 | Tipagem estática |
| Vite | 5.3 | Build e dev server |
| Supabase (JS SDK) | 2.110 | Cliente do banco PostgreSQL |
| lucide-react | 0.383 | Ícones |
| PostgreSQL | (gerenciado) | Banco de dados relacional |

### Estrutura completa das pastas

```
project/
├── index.html                  # HTML raiz
├── package.json                # Dependências e scripts
├── tsconfig.json               # Configuração TypeScript
├── vite.config.ts              # Configuração Vite
├── .env                        # Variáveis de ambiente (Supabase)
├── docs/
│   ├── DOCUMENTACAO_TECNICA.md # Este arquivo
│   └── SRS.md                  # Especificação de requisitos
├── supabase/
│   └── migrations/
│       └── 001_create_wms_tables.sql  # Schema do banco
└── src/
    ├── main.tsx                # Entry point React
    ├── App.tsx                 # Componente raiz
    ├── vite-env.d.ts           # Tipos de ambiente
    ├── pages/
    │   └── StagesPage.tsx      # Tela operacional principal
    ├── components/
    │   ├── StageMap.tsx        # Mapa visual de posições
    │   ├── SearchPanel.tsx     # Painel de pesquisa
    │   ├── ConfigPanel.tsx     # Modal de configuração
    │   ├── PositionModal.tsx   # Modal de posição (cadastro/edição/liberação)
    │   ├── CarrierCombobox.tsx # Combobox pesquisável de transportadoras
    │   └── ui/                 # Design System
    │       ├── Button.tsx
    │       ├── Field.tsx
    │       ├── Modal.tsx
    │       ├── Row.tsx
    │       ├── Toast.tsx
    │       └── index.ts
    ├── hooks/
    │   ├── useWmsData.ts       # Hook central de dados e regras de negócio
    │   ├── useToast.ts         # Notificações temporárias
    │   ├── useMapHighlight.ts  # Destaque de posições no mapa
    │   └── useDebouncedValue.ts # Debounce para pesquisa
    ├── services/
    │   ├── storage.ts          # Camada de persistência (Supabase)
    │   └── search.ts           # Lógica de pesquisa pura
    ├── styles/
    │   └── tokens.ts           # Design tokens (cores, espaçamentos, raios)
    ├── types/
    │   └── index.ts            # Tipos de domínio
    └── utils/
        ├── uid.ts              # Gerador de UUIDs
        └── tro.ts              # Normalização de TRO
```

---

## Descrição de TODOS os componentes

### `StagesPage.tsx`
Tela operacional principal. Renderiza o cabeçalho (título + sincronização + botão Configuração), os indicadores (total/livres/ocupados/taxa), as abas de Stages, o mapa do Stage ativo, o painel de pesquisa e os modais. Orquestra os hooks `useWmsData`, `useToast` e `useMapHighlight`.

### `StageMap.tsx`
Mapa visual em grade. Colunas = Ruas, linhas = Posições. Cada célula é um botão circular: verde (livre) ou vermelho (ocupado, com ícone de pacote). Posições destacadas pela pesquisa recebem borda azul. Componente memoizado (`React.memo`) para evitar re-renderizações desnecessárias.

### `SearchPanel.tsx`
Painel de pesquisa lateral. Alternância entre TRO e Transportadora. Campo com debounce de 350ms. Resultados agrupados por Stage, cada grupo com botão "Visualizar no mapa".

### `ConfigPanel.tsx`
Modal de configuração com duas abas: Stages (criar com nome/ruas/posições, listar e excluir) e Transportadoras (criar e excluir). Componente puramente apresentacional — as validações vivem em `useWmsData`.

### `PositionModal.tsx`
Modal único de posição com três modos: cadastro (posição livre), visualização (posição ocupada, modo leitura) e edição (posição ocupada, modo edição). Inclui botão "Liberar posição" para remover o palete.

### `CarrierCombobox.tsx`
Combobox pesquisável para seleção de transportadora. Filtra por nome, fecha ao clicar fora, mostra check no item selecionado. Garante que a transportadora seja sempre selecionada da lista (nunca digitação livre).

### `ui/Button.tsx`
Botão padronizado com 5 variantes: primary, secondary, danger, success, ghost. Inclui ícone opcional, estado disabled e efeito de hover.

### `ui/Field.tsx`
Wrapper de rótulo + campo. Inclui `TextInput` com foco visual (borda azul ao focar).

### `ui/Modal.tsx`
Estrutura base de modal: overlay, título, descrição, corpo, rodapé. Fecha ao clicar no overlay ou no botão X.

### `ui/Row.tsx`
Linha rótulo/valor reutilizável para telas de detalhe.

### `ui/Toast.tsx`
Notificação temporária fixa no rodapé. Variantes success e error.

### `ui/index.ts`
Barrel export dos componentes de UI.

---

## Descrição de TODOS os hooks

### `useWmsData`
Hook central de dados. Concentra TODAS as regras de negócio de leitura/escrita. Expõe:
- Estado: `loading`, `stages`, `carriers`, `pallets`, `lastSync`, `occupiedByStage`, `indicators`.
- Operações: `createStage`, `deleteStage`, `createCarrier`, `deleteCarrier`, `savePallet`, `releasePallet`, `refresh`.

Carrega dados do Supabase na inicialização. Toda escrita atualiza o estado local e persiste no banco imediatamente.

### `useToast`
Gerencia notificações temporárias. `showToast(message, type)` exibe uma toast que desaparece após 2800ms. Cancela toast anterior se uma nova for exibida.

### `useMapHighlight`
Gerencia o destaque de posições no mapa. `highlightOnStage(stageId, positionKeys)` destaca posições em azul e remove o destaque após 3200ms. Inclui limpeza do timer no desmontar.

### `useScrollToHighlight`
Centraliza a primeira posição destacada na tela via `scrollIntoView`.

### `useDebouncedValue`
Atrasa a propagação de um valor em `delay` ms. Usado pela pesquisa para evitar consultar a cada tecla.

---

## Descrição de TODOS os services

### `storage.ts`
Camada de persistência usando Supabase. Isola toda a lógica de acesso ao banco. Funções:
- `loadAll()`: carrega stages, carriers e pallets em paralelo.
- `saveStages(stages)`: sincroniza a lista de stages (upsert + delete diff).
- `saveCarriers(carriers)`: sincroniza a lista de carriers.
- `savePallets(pallets)`: sincroniza a lista de pallets.

Mapeia campos snake_case (DB) para camelCase (TS).

### `search.ts`
Lógica de pesquisa pura (sem estado, sem side-effects). Funções:
- `searchPallets({ type, query, pallets, stages, carriers })`: pesquisa por TRO (correspondência exata após normalização) ou transportadora (parte do nome, case-insensitive). Sempre pesquisa em todos os Stages. Retorna resultados ordenados por Stage → Rua → Posição.
- `groupResultsByStage(results)`: agrupa resultados por Stage, preservando a ordem.

---

## Descrição de TODOS os types

### `Stage`
```typescript
{ id: string; name: string; streets: number; positions: number; createdAt: number }
```

### `Carrier`
```typescript
{ id: string; name: string; active: boolean; createdAt: number }
```

### `Pallet`
```typescript
{ id: string; stageId: string; carrierId: string; street: number; position: number; tro: string; shipment: string; createdAt: number; updatedAt: number }
```

### `SearchType`
`"tro" | "carrier"`

### `SearchResultRow`
```typescript
{ pallet: Pallet; stage: Stage; carrier?: Carrier }
```

### `SearchResultGroup`
```typescript
{ stage: Stage; items: SearchResultRow[] }
```

### `ToastState`
```typescript
{ message: string; type: "success" | "error" }
```

### `PositionSelection`
```typescript
{ stage: Stage; street: number; position: number; pallet?: Pallet }
```

### `OccupancyMap`
`Record<string, Pallet>` — chave = `${street}-${position}`

### `HighlightSet`
`Set<string>` — chave = `${stageId}:${street}-${position}`

---

## Descrição de TODOS os utils

### `uid.ts`
Gera UUIDs válidos (RFC 4122). Usa `crypto.randomUUID()` quando disponível, com fallback para implementação manual. Necessário porque as colunas `id` do banco são do tipo `uuid`.

### `tro.ts`
Regras de negócio do campo TRO:
- `normalizeTRODigits(raw)`: remove tudo que não for dígito.
- `formatTRO(raw)`: aplica máscara `TRO-` + dígitos.
- `stripLeadingZeros(digits)`: remove zeros à esquerda.
- `troSearchKey(raw)`: chave de comparação para pesquisa (normalizada + sem zeros à esquerda).

---

## Fluxo completo do cadastro

1. Usuário clica em posição livre no mapa → `openPosition(stage, street, position)`.
2. `StagesPage` abre `PositionModal` em modo cadastro.
3. Usuário seleciona transportadora (combobox), digita TRO e remessa opcional.
4. Clica em "Salvar" → `handleSave` valida campos obrigatórios.
5. `onSave` → `handleSavePallet` em `StagesPage` → `savePallet` em `useWmsData`.
6. `savePallet` verifica conflito de posição, cria o registro, atualiza estado local e persiste no Supabase.
7. Em sucesso, `setPosModal(null)` fecha o modal automaticamente.
8. Em erro, o modal permanece aberto com a mensagem.

---

## Fluxo completo da pesquisa

1. Usuário digita no campo de pesquisa → `useDebouncedValue` aguarda 350ms.
2. `searchPallets` filtra pallets por TRO (correspondência exata normalizada) ou transportadora (parte do nome).
3. `groupResultsByStage` agrupa por Stage.
4. Resultados renderizados em grupos, cada um com botão "Visualizar no mapa".
5. Clique no botão → `handleViewOnMap` → troca Stage ativo e destaca posições via `highlightOnStage`.
6. `useScrollToHighlight` rola a tela para a primeira posição destacada.

---

## Fluxo completo do mapa

1. `StagesPage` determina o Stage ativo (primeiro ou selecionado pelo usuário).
2. `StageMap` recebe `stage`, `occupied` (mapa de ocupação), `highlighted` (destaque da pesquisa).
3. Gera a grade dinamicamente: colunas = ruas, linhas = posições.
4. Cada célula é um botão circular colorido (verde/vermelho) com hover scale.
5. Clique em posição → `onPositionClick` → abre `PositionModal`.

---

## Fluxo completo das configurações

1. Clique em "Configuração" no cabeçalho → abre `ConfigPanel`.
2. Aba Stages: formulário (nome, ruas, posições) + lista com exclusão.
3. Aba Transportadoras: formulário (nome) + lista com exclusão.
4. Criar Stage → `createStage` valida nome duplicado, cria, persiste.
5. Excluir Stage → `deleteStage` verifica se há paletes vinculados (bloqueia se houver).
6. Criar/Excluir Transportadora → validações análogas.

---

## Todas as regras de negócio

| # | Regra | Implementação |
|---|---|---|
| 3.8 | Nunca permitir dois paletes na mesma Stage+Rua+Posição | `savePallet` verifica conflito + constraint UNIQUE no banco |
| 3.9 | Cadastro requer transportadora e TRO | `PositionModal.handleSave` valida |
| 3.10 | Transportadora nunca é digitação livre | `CarrierCombobox` (seleção da lista) |
| 3.12 | Liberação remove o palete da posição | `releasePallet` |
| 3.13 | Nome de Stage é único (case-insensitive) | `createStage` valida |
| 5.4 | Não excluir Stage com paletes vinculados | `deleteStage` bloqueia |
| 5.5 | Não excluir Transportadora com paletes vinculados | `deleteCarrier` bloqueia |
| 6.4 | Pesquisa por TRO: correspondência exata após normalização | `searchPallets` + `troSearchKey` |
| 6.6 | Resultados ordenados por Stage → Rua → Posição | `searchPallets` sort |
| 6.12/6.13 | Destaque do mapa remove-se automaticamente | `useMapHighlight` (3200ms) |
| 6.14 | Debounce de pesquisa 300-500ms | `useDebouncedValue` (350ms) |
| 7.11 | Combobox pesquisável para transportadora | `CarrierCombobox` |
| 9.4 | Colunas = Ruas, linhas = Posições (sempre) | `StageMap` |
| 10.19 | Nunca usar alert() do navegador | `Toast` |

---

## Estrutura completa do banco de dados

### Tabela `stages`
| Coluna | Tipo | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | UNIQUE NOT NULL |
| streets | integer | NOT NULL, CHECK > 0 |
| positions | integer | NOT NULL, CHECK > 0 |
| created_at | timestamptz | DEFAULT now() |

### Tabela `carriers`
| Coluna | Tipo | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | UNIQUE NOT NULL |
| active | boolean | NOT NULL DEFAULT true |
| created_at | timestamptz | DEFAULT now() |

### Tabela `pallets`
| Coluna | Tipo | Constraints |
|---|---|---|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| stage_id | uuid | NOT NULL, FK → stages(id) ON DELETE CASCADE |
| carrier_id | uuid | NOT NULL, FK → carriers(id) ON DELETE RESTRICT |
| street | integer | NOT NULL, CHECK > 0 |
| position | integer | NOT NULL, CHECK > 0 |
| tro | text | NOT NULL |
| shipment | text | DEFAULT '' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

**Constraint única**: `UNIQUE (stage_id, street, position)` — garante regra 3.8 no nível do banco.

### Relacionamentos
- `pallets.stage_id` → `stages.id` (CASCADE) — excluir stage remove seus paletes.
- `pallets.carrier_id` → `carriers.id` (RESTRICT) — não excluir carrier com paletes vinculados.

### Índices
- `idx_pallets_stage_id` em `pallets(stage_id)` — acelera filtro por Stage.
- `idx_pallets_carrier_id` em `pallets(carrier_id)` — acelera filtro por transportadora.
- `idx_pallets_tro` em `pallets(tro)` — acelera pesquisa por TRO.

### Trigger
- `update_pallets_updated_at` — atualiza `updated_at` automaticamente em UPDATE.

### RLS (Row Level Security)
Todas as tabelas têm RLS habilitado com políticas para `anon` e `authenticated` permitindo CRUD completo (single-tenant, sem autenticação).

---

## Fluxos de dados

### Fluxo de gravação
```
Componente → useWmsData (valida regra de negócio) → setEstado local → wmsStorage.saveXxx() → Supabase (upsert/delete) → PostgreSQL
```

### Fluxo de leitura
```
useWmsData (useEffect na inicialização) → wmsStorage.loadAll() → Supabase (SELECT) → mapeia rows → setEstado local → componentes
```

### Fluxo de atualização
```
Componente → useWmsData.savePallet (modo edição) → setPallets (map substituindo o registro) → wmsStorage.savePallets (upsert) → trigger atualiza updated_at
```

### Fluxo de exclusão
```
Componente → useWmsData.deleteXxx/releasePallet → setXxx (filter removendo) → wmsStorage.saveXxx (delete diff) → Supabase
```

---

## Como instalar

```bash
npm install
```

## Como executar (desenvolvimento)

```bash
npm run dev
```

## Como publicar (build de produção)

```bash
npm run build
npm run preview
```

## Como configurar o ambiente

O arquivo `.env` deve conter:
```
VITE_SUPABASE_URL=<url-do-projeto-supabase>
VITE_SUPABASE_ANON_KEY=<chave-anon>
```

## Como configurar o banco

A migration em `supabase/migrations/001_create_wms_tables.sql` cria todas as tabelas, índices, constraints, trigger e políticas RLS. Aplicar via Supabase MCP ou painel do Supabase.

## Como adicionar novas funcionalidades

1. **Nova tela**: criar em `src/pages/`, usar hooks existentes (`useWmsData`).
2. **Novo componente de UI**: adicionar em `src/components/ui/`, exportar em `index.ts`.
3. **Nova regra de negócio**: adicionar em `useWmsData` (nunca em componentes).
4. **Nova tabela**: criar migration, adicionar mapper em `storage.ts`, adicionar tipo em `types/index.ts`.
5. **Nova pesquisa**: estender `search.ts` (lógica pura).

## Boas práticas

- Componentes nunca acessam o banco diretamente — sempre via `useWmsData` ou `wmsStorage`.
- Regras de negócio ficam em hooks/services, nunca em componentes.
- Design tokens em `styles/tokens.ts` — nunca cores/espaçamentos soltos.
- IDs sempre gerados por `uid()` (UUIDs válidos para o banco).
- TRO normalizado apenas via `utils/tro.ts`.

## Melhorias futuras

- Autenticação de usuários (multi-tenant).
- Histórico de alterações (auditoria).
- Dashboard com gráficos de ocupação.
- Exportação de relatórios (CSV/PDF).
- Real-time via Supabase subscriptions.
- Testes unitários (Vitest) para services e hooks.
- Paginação para stages com muitas posições.
