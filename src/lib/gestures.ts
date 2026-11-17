// Detecção de gestos a partir dos 21 pontos da mão do MediaPipe.
// Mesma lógica usada no Handy Bird (github.com/Lopespp/Handy-Bird).

export interface Point {
  x: number;
  y: number;
}

const PALM = [0, 5, 9, 13, 17];

export function palmCenter(points: Point[]): Point | null {
  if (points.length !== 21) return null;
  return {
    x: PALM.reduce((total, index) => total + points[index].x, 0) / PALM.length,
    y: PALM.reduce((total, index) => total + points[index].y, 0) / PALM.length,
  };
}

/** Sinal de paz: indicador e médio esticados, anelar e mínimo dobrados. */
export function isPeaceSign(points: Point[], aspectRatio = 1): boolean {
  if (points.length !== 21) return false;
  const distance = (point: Point) => Math.hypot((point.x - points[0].x) * aspectRatio, point.y - points[0].y);
  const extended = (joint: number, tip: number) => distance(points[tip]) > distance(points[joint]) * 1.15;
  const curled = (joint: number, tip: number) => distance(points[tip]) < distance(points[joint]) * 0.95;
  return extended(6, 8) && extended(10, 12) && curled(14, 16) && curled(18, 20);
}

/** Punho fechado, com histerese para não oscilar no limite. */
export function isFistClosed(points: Point[], aspectRatio = 1, wasClosed = false): boolean {
  if (points.length !== 21) return false;
  const distanceSquared = (point: Point) =>
    ((point.x - points[0].x) * aspectRatio) ** 2 + (point.y - points[0].y) ** 2;
  const threshold = wasClosed ? 1.05 : 0.9;
  const fingers: [number, number][] = [
    [6, 8],
    [10, 12],
    [14, 16],
    [18, 20],
  ];
  return (
    fingers.filter(
      ([joint, tip]) =>
        distanceSquared(points[joint]) > 1e-8 &&
        distanceSquared(points[tip]) < distanceSquared(points[joint]) * threshold ** 2,
    ).length >= 3
  );
}

/**
 * Com uma mão rastreada, o MediaPipe segue a mesma mão entre quadros. O risco é
 * perder essa mão e reencontrar a outra: uma mão de lateralidade diferente,
 * longe da última posição e pouco depois da perda é ignorada até a trava expirar.
 */
export class HandLock {
  private center: Point | null = null;
  private label: string | null = null;
  private seenAt = -Infinity;

  constructor(
    private readonly window = 1,
    private readonly maxJump = 0.3,
  ) {}

  reset(): void {
    this.center = null;
    this.label = null;
    this.seenAt = -Infinity;
  }

  accept(points: Point[], label: string | null, now: number): boolean {
    const center = palmCenter(points);
    if (!center) return false;
    const locked = this.center !== null && now - this.seenAt < this.window;
    if (
      locked &&
      label &&
      this.label &&
      label !== this.label &&
      Math.hypot(center.x - this.center!.x, center.y - this.center!.y) > this.maxJump
    ) {
      return false;
    }
    if (!locked || !this.label) this.label = label ?? null;
    this.center = center;
    this.seenAt = now;
    return true;
  }
}
