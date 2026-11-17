import { Fragment } from 'react';

/** Renderiza texto do conteúdo, transformando **trechos** em negrito. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-text">
            {part}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export const plain = (text: string): string => text.replace(/\*\*(.+?)\*\*/g, '$1');
