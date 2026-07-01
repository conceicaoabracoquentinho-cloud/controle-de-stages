/**
 * Gerador de IDs. Isolado em um único lugar para que, no futuro, possa ser
 * substituído por `crypto.randomUUID()` ou IDs vindos de um backend real
 * sem precisar tocar nos componentes que o consomem.
 */
export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
