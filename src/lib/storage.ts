/** localStorage pode estar bloqueado (modo privado, políticas do navegador). */
export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento, a escolha vale só para esta visita.
  }
}

export const STORAGE_KEYS = { theme: 'pl:theme', lang: 'pl:lang' } as const;
