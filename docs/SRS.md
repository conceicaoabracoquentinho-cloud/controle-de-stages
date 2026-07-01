# Software Requirements Specification (SRS)
## Controle de Stages — Warehouse Management System (WMS)

**Versão**: 1.0  
**Data**: 2026-07-01  
**Status**: Aprovado para implementação

---

## 1. Objetivo do sistema

O Controle de Stages é um sistema de Warehouse Management System (WMS) que controla a ocupação de posições em áreas de armazenagem (Stages). O sistema permite cadastrar paletes em posições específicas, pesquisá-los por TRO ou transportadora, visualizar a ocupação em mapa visual e gerenciar a configuração de Stages e Transportadoras.

## 2. Escopo

### Inclui
- Cadastro, edição e liberação de paletes em posições de Stages.
- Pesquisa de paletes por TRO ou transportadora em todos os Stages.
- Visualização em mapa visual (grade de ruas × posições).
- Cadastro e exclusão de Stages e Transportadoras.
- Indicadores de ocupação (total, livres, ocupados, taxa).
- Persistência em banco de dados relacional (Supabase/PostgreSQL).

### Não inclui (futuro)
- Autenticação de usuários / multi-tenant.
- Histórico de alterações / auditoria.
- Dashboard com gráficos.
- Exportação de relatórios.
- Real-time (sincronização entre múltiplos clientes).

## 3. Requisitos funcionais

### RF-01 — Cadastro de Stage
O sistema deve permitir cadastrar Stages com nome único, número de ruas e número de posições.

### RF-02 — Exclusão de Stage
O sistema deve permitir excluir Stages que não possuam paletes cadastrados. Stages com paletes vinculados não podem ser excluídos.

### RF-03 — Cadastro de Transportadora
O sistema deve permitir cadastrar Transportadoras com nome único.

### RF-04 — Exclusão de Transportadora
O sistema deve permitir excluir Transportadoras que não possuam paletes vinculados.

### RF-05 — Cadastro de Palete
O sistema deve permitir cadastrar um palete em uma posição livre, informando transportadora (seleção da lista), TRO e remessa opcional.

### RF-06 — Edição de Palete
O sistema deve permitir editar a transportadora, TRO e remessa de um palete existente.

### RF-07 — Liberação de Posição
O sistema deve permitir liberar uma posição ocupada, removendo o palete cadastrado.

### RF-08 — Pesquisa por TRO
O sistema deve permitir pesquisar paletes por TRO, com correspondência exata após normalização (remoção de prefixo, espaços, zeros à esquerda).

### RF-09 — Pesquisa por Transportadora
O sistema deve permitir pesquisar paletes por parte do nome da transportadora (case-insensitive).

### RF-10 — Pesquisa em todos os Stages
A pesquisa sempre considera todos os Stages, nunca apenas o Stage ativo.

### RF-11 — Visualização no Mapa
O sistema deve permitir visualizar no mapa as posições encontradas na pesquisa, destacando-as em azul.

### RF-12 — Indicadores de Ocupação
O sistema deve exibir indicadores: total de posições, posições livres, posições ocupadas e taxa de ocupação.

### RF-13 — Persistência de Dados
Todos os dados (Stages, Transportadoras, Paletes) devem ser persistidos em banco de dados e carregados automaticamente ao abrir a aplicação.

### RF-14 — Fechamento automático do modal
Após salvar um palete com sucesso, o modal de cadastro deve fechar automaticamente. Em caso de erro, o modal deve permanecer aberto.

## 4. Requisitos não funcionais

### RNF-01 — Performance
- Debounce de pesquisa: 300-500ms.
- Mapa memoizado para evitar re-renderizações desnecessárias.
- Índices no banco para consultas frequentes.

### RNF-02 — Usabilidade
- Interface em português (pt-BR).
- Design System consistente (tokens únicos de cor/espaçamento).
- Notificações via Toast (nunca alert do navegador).
- Combobox pesquisável para transportadora (nunca digitação livre).

### RNF-03 — Confiabilidade
- Persistência real em banco de dados (sem LocalStorage/SessionStorage).
- Constraint UNIQUE no banco para impedir duplicidade de posição.
- Validações de regra de negócio no cliente e no banco.

### RNF-04 — Manutenibilidade
- Arquitetura em camadas (apresentação / estado / serviços / dados).
- Single Responsibility Principle.
- Tipos centralizados.
- Design tokens centralizados.

### RNF-05 — Compatibilidade
- Navegadores modernos (ES2020+).
- Responsivo (mobile a desktop).

### RNF-06 — Segurança
- RLS habilitado em todas as tabelas.
- Acesso via anon key (single-tenant, sem auth).

## 5. Regras de negócio

| ID | Regra |
|---|---|
| RN-01 | Nunca permitir dois paletes na mesma Stage+Rua+Posição |
| RN-02 | Transportadora é sempre selecionada da lista (nunca digitação livre) |
| RN-03 | Nome de Stage é único (case-insensitive) |
| RN-04 | Nome de Transportadora é único (case-insensitive) |
| RN-05 | Não excluir Stage com paletes vinculados |
| RN-06 | Não excluir Transportadora com paletes vinculados |
| RN-07 | TRO é normalizado (apenas dígitos) para pesquisa |
| RN-08 | Pesquisa por TRO remove zeros à esquerda para comparação |
| RN-09 | Resultados ordenados por Stage → Rua → Posição |
| RN-10 | Colunas do mapa = Ruas, linhas = Posições (sempre de cima para baixo) |
| RN-11 | Destaque do mapa remove-se automaticamente após 3.2s |
| RN-12 | Modal fecha automaticamente após salvar com sucesso |

## 6. Fluxos completos

### Fluxo de Cadastro de Palete
```
Usuário clica em posição livre
  → Sistema abre PositionModal (modo cadastro)
  → Usuário seleciona transportadora, digita TRO, remessa opcional
  → Usuário clica "Salvar"
  → Sistema valida campos obrigatórios
  → Sistema verifica conflito de posição
  → Sistema cria registro de palete
  → Sistema persiste no banco
  → Sistema atualiza mapa e indicadores
  → Sistema fecha modal automaticamente
  → Sistema exibe Toast de sucesso
```

### Fluxo de Pesquisa
```
Usuário seleciona tipo (TRO ou Transportadora)
  → Usuário digita query
  → Sistema aguarda debounce (350ms)
  → Sistema normaliza query
  → Sistema filtra pallets em todos os Stages
  → Sistema ordena resultados (Stage → Rua → Posição)
  → Sistema agrupa por Stage
  → Sistema renderiza grupos com botão "Visualizar no mapa"
```

### Fluxo de Liberação
```
Usuário clica em posição ocupada
  → Sistema abre PositionModal (modo visualização)
  → Usuário clica "Liberar posição"
  → Sistema remove palete do estado
  → Sistema persiste no banco (delete)
  → Sistema atualiza mapa e indicadores
  → Sistema fecha modal
  → Sistema exibe Toast de sucesso
```

### Fluxo de Carregamento
```
Aplicação abre
  → useWmsData executa loadAll()
  → wmsStorage.loadAll() consulta Supabase (stages, carriers, pallets em paralelo)
  → Mapeia rows para tipos de domínio
  → Atualiza estado local
  → Componentes renderizam com dados do banco
```

## 7. Casos de uso

### UC-01 — Cadastrar Stage
**Ator**: Operador  
**Pré-condição**: nenhuma  
**Fluxo principal**:
1. Operador abre Configuração
2. Seleciona aba Stages
3. Preenche nome, ruas, posições
4. Clica "Criar Stage"
5. Sistema valida nome único
6. Sistema cria e persiste Stage

**Fluxo alternativo**: Nome duplicado → Toast de erro.

### UC-02 — Cadastrar Palete
**Ator**: Operador  
**Pré-condição**: Stage e Transportadora cadastrados  
**Fluxo principal**:
1. Operador clica em posição livre no mapa
2. Sistema abre modal de cadastro
3. Operador seleciona transportadora, digita TRO
4. Clica "Salvar"
5. Sistema valida e persiste
6. Sistema fecha modal

**Fluxo alternativo**: Posição ocupada → Toast de erro, modal permanece aberto.

### UC-03 — Pesquisar Palete
**Ator**: Operador  
**Pré-condição**: pelo menos um palete cadastrado  
**Fluxo principal**:
1. Operador seleciona tipo de pesquisa
2. Digita query
3. Sistema retorna resultados agrupados por Stage
4. Operador clica "Visualizar no mapa"
5. Sistema troca Stage ativo e destaca posições

### UC-04 — Liberar Posição
**Ator**: Operador  
**Pré-condição**: posição ocupada  
**Fluxo principal**:
1. Operador clica em posição ocupada
2. Sistema abre modal de visualização
3. Operador clica "Liberar posição"
4. Sistema remove palete e persiste
5. Sistema fecha modal

### UC-05 — Editar Palete
**Ator**: Operador  
**Pré-condição**: palete cadastrado  
**Fluxo principal**:
1. Operador clica em posição ocupada
2. Sistema abre modal de visualização
3. Operador clica "Editar"
4. Sistema muda para modo edição
5. Operador altera campos
6. Clica "Salvar"
7. Sistema atualiza e persiste

## 8. Estrutura do banco

### Diagrama ER
```
stages (1) ──────< (N) pallets >────── (1) carriers
  id                stage_id              id
  name              carrier_id            name
  streets           street               active
  positions         position
                    tro
                    shipment
```

### Tabelas

**stages**: id (uuid PK), name (text UNIQUE), streets (int CHECK>0), positions (int CHECK>0), created_at (timestamptz)

**carriers**: id (uuid PK), name (text UNIQUE), active (bool), created_at (timestamptz)

**pallets**: id (uuid PK), stage_id (uuid FK), carrier_id (uuid FK), street (int CHECK>0), position (int CHECK>0), tro (text), shipment (text), created_at (timestamptz), updated_at (timestamptz), UNIQUE(stage_id, street, position)

### Índices
- idx_pallets_stage_id (pallets.stage_id)
- idx_pallets_carrier_id (pallets.carrier_id)
- idx_pallets_tro (pallets.tro)

### Trigger
- update_pallets_updated_at: atualiza updated_at em UPDATE.

## 9. Arquitetura

```
Apresentação (components/pages)
    ↓
Estado/Regras (hooks)
    ↓
Serviços (services)
    ↓
Dados (Supabase/PostgreSQL)
```

**Princípios**:
- Componentes não acessam banco diretamente.
- Regras de negócio em hooks, não em componentes.
- Lógica de pesquisa é pura (sem side-effects).
- Design tokens centralizados.

## 10. Modelo de dados

### Tipos de domínio (TypeScript)
- `Stage`: { id, name, streets, positions, createdAt }
- `Carrier`: { id, name, active, createdAt }
- `Pallet`: { id, stageId, carrierId, street, position, tro, shipment, createdAt, updatedAt }

### Mapeamento DB ↔ App
- stage_id → stageId
- carrier_id → carrierId
- created_at → createdAt (timestamp → epoch ms)
- updated_at → updatedAt (timestamp → epoch ms)

## 11. Plano de evolução

### Fase 2 — Autenticação
- Login com email/senha (Supabase Auth).
- Multi-tenant (dados isolados por organização).
- RLS com auth.uid().

### Fase 3 — Auditoria
- Tabela `pallet_history` (insert/update/delete triggers).
- Tela de histórico por posição.

### Fase 4 — Dashboard
- Gráficos de ocupação temporal.
- Exportação CSV/PDF.

### Fase 5 — Real-time
- Supabase subscriptions para sincronização entre clientes.

## 12. Escalabilidade

- **Horizontal**: Supabase gerencia conexões e réplicas.
- **Índices**: já existem para consultas frequentes (stage_id, carrier_id, tro).
- **Paginação**: futura, para stages com muitas posições.
- **Cache**: derivados memoizados no cliente (occupiedByStage, indicators).

## 13. Segurança

- **RLS**: habilitado em todas as tabelas.
- **Políticas**: anon + authenticated com CRUD (single-tenant atual).
- **Chaves**: anon key no cliente (segura para operações permitidas pelo RLS).
- **Futuro**: service role apenas em Edge Functions (nunca no cliente).

## 14. Performance

- **Debounce**: pesquisa com 350ms.
- **Memoização**: StageMap (React.memo), occupiedByStage e indicators (useMemo).
- **Índices**: stage_id, carrier_id, tro.
- **Paralelismo**: loadAll carrega 3 tabelas em paralelo (Promise.all).
- **Bundle**: ~392KB (111KB gzip) — aceitável para aplicação interna.

## 15. Manutenção

- **Migrations**: versionadas em `supabase/migrations/`.
- **Tipos**: centralizados em `src/types/index.ts`.
- **Tokens**: centralizados em `src/styles/tokens.ts`.
- **Build**: `npm run build` (tsc + vite).
- **Sem testes automatizados ainda** (futuro: Vitest).
