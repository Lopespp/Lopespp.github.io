import type { Content } from '../content/types';

/**
 * Cruza o campo `stack` de projetos, experiências e entregas para dizer onde
 * cada skill foi usada. Devolve: id da skill -> lista de nomes curtos.
 */
export function whereUsed(content: Content): Map<string, string[]> {
  const usage = new Map<string, string[]>();
  const add = (stack: string[], label: string) => {
    for (const id of stack) {
      const list = usage.get(id) ?? [];
      if (!list.includes(label)) list.push(label);
      usage.set(id, list);
    }
  };
  for (const project of content.gold.projects) add(project.stack, project.short);
  for (const experience of content.gold.experiences) {
    for (const delivery of experience.deliveries ?? []) add(delivery.stack, delivery.short);
    add(experience.stack, experience.short);
  }
  return usage;
}
