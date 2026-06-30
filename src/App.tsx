import { StagesPage } from "./pages/StagesPage";

/**
 * Ponto de entrada. Mantido propositalmente fino: a Etapa 3 (Dashboard,
 * Histórico, etc.) poderá introduzir roteamento aqui (ex: react-router)
 * sem qualquer impacto nos componentes/hooks/services já existentes.
 */
export default function App() {
  return <StagesPage />;
}
