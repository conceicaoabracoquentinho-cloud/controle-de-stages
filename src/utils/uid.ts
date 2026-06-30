/**
 * Gerador de IDs. Isolado em um único lugar para que, no futuro, possa ser
 * substituído por `crypto.randomUUID()` ou IDs vindos de um backend real
 * sem precisar tocar nos componentes que o consomem.
 */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
