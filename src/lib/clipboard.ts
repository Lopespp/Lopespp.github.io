/** Copia texto. Devolve `false` quando o navegador não deixa (sem Clipboard API ou permissão negada). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Seleciona o texto de um elemento, para o visitante copiar com Ctrl+C. */
export function selectText(node: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(node);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
