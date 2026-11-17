import { useEffect, useState } from 'react';

const base = import.meta.env.BASE_URL;

interface ProjectImageProps {
  /** Caminho em public/, sem extensão (.webp e .jpg). */
  path: string;
  alt: string;
  /** Nome exibido no card de fallback se a imagem falhar. */
  name: string;
}

/** Imagem de projeto: skeleton enquanto carrega e card em gradiente se falhar. */
export function ProjectImage({ path, alt, name }: ProjectImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [node, setNode] = useState<HTMLImageElement | null>(null);

  // A imagem pode ter carregado (ou falhado) antes de o React assumir a página.
  useEffect(() => {
    if (!node?.complete) return;
    setStatus(node.naturalWidth > 0 ? 'loaded' : 'error');
  }, [node]);

  if (status === 'error') {
    return (
      <div
        role="img"
        aria-label={name}
        className="flex aspect-[1200/630] w-full items-center lg:aspect-auto lg:h-full lg:min-h-80 justify-center bg-linear-to-br from-gold/35 via-gold/15 to-surface-2 p-6"
      >
        <span className="font-display text-3xl font-bold text-text">{name}</span>
      </div>
    );
  }

  return (
    <div
      className={`aspect-[1200/630] w-full bg-surface-2 lg:aspect-auto lg:h-full lg:min-h-80 ${
        status === 'loading' ? 'skeleton' : ''
      }`}
    >
      <picture className="block size-full">
        <source
          type="image/webp"
          srcSet={`${base}${path}-720.webp 720w, ${base}${path}.webp 1200w`}
          sizes="(min-width: 1025px) 560px, 100vw"
        />
        <img
          ref={setNode}
          src={`${base}${path}.jpg`}
          alt={alt}
          width={1200}
          height={630}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`img-fade size-full object-cover lg:object-left-top ${status === 'loaded' ? 'is-loaded' : ''}`}
        />
      </picture>
    </div>
  );
}
