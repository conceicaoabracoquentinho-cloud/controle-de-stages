import { useEffect, useState } from "react";

/**
 * Atrasa a propagação de um valor em `delay` ms. Usado pela pesquisa
 * (300–500ms, Capítulo 06.14 do SRS) para evitar consultar a cada tecla.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
