import { m, useMotionValue, useSpring } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';
import { useApp } from '../state/app';

interface TiltProps {
  children: ReactNode;
  /** Inclinação máxima, em graus. */
  max: number;
  className?: string;
}

/** Leve tilt 3D seguindo o mouse. Desligado em toque e com movimento reduzido. */
export function Tilt({ children, max, className }: TiltProps) {
  const { reducedMotion } = useApp();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(y, { stiffness: 180, damping: 18 });

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - rect.left) / rect.width - 0.5;
    const vertical = (event.clientY - rect.top) / rect.height - 0.5;
    y.set(horizontal * 2 * max);
    x.set(-vertical * 2 * max);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
    >
      {children}
    </m.div>
  );
}
