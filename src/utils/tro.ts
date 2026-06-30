/**
 * Regras de negócio do campo TRO — Capítulo 03 (Cadastro) e 06 (Pesquisa)
 * do SRS. Estas funções são a ÚNICA fonte de verdade para normalização de
 * TRO no projeto inteiro; nunca duplicar esta lógica em componentes.
 */

/** Remove tudo que não for dígito. */
export function normalizeTRODigits(raw: string | null | undefined): string {
  return (raw || "").replace(/\D/g, "");
}

/** Aplica a máscara oficial: prefixo "TRO-" fixo + dígitos informados. */
export function formatTRO(raw: string | null | undefined): string {
  const digits = normalizeTRODigits(raw);
  return digits ? `TRO-${digits}` : "TRO-";
}

/**
 * Remove zeros à esquerda para permitir que "00012345" e "12345"
 * sejam tratados como o mesmo TRO durante a pesquisa (regra 2.5/6.4).
 */
export function stripLeadingZeros(digits: string): string {
  const stripped = digits.replace(/^0+/, "");
  return stripped.length ? stripped : digits ? "0" : "";
}

/** Chave de comparação usada pela pesquisa por TRO. */
export function troSearchKey(raw: string | null | undefined): string {
  return stripLeadingZeros(normalizeTRODigits(raw));
}
