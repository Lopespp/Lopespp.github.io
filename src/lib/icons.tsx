import {
  Activity,
  BookOpen,
  ChartColumn,
  Clapperboard,
  Cloud,
  Database,
  Dumbbell,
  Factory,
  Flame,
  Gamepad2,
  GraduationCap,
  Headphones,
  Image as ImageIcon,
  Layers,
  Mail,
  Newspaper,
  Repeat,
  Scale,
  Sparkles,
  Timer,
  UserRound,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  siApacheairflow,
  siApachespark,
  siCss,
  siDatabricks,
  siGit,
  siGithub,
  siGithubactions,
  siGooglecloud,
  siHtml5,
  siJavascript,
  siJupyter,
  siMediapipe,
  siMlflow,
  siNodedotjs,
  siNumpy,
  siPandas,
  siPython,
  siScikitlearn,
} from 'simple-icons';

/**
 * Ícones disponíveis para o conteúdo (campo `icon`). Marcas vêm do Simple Icons;
 * o resto, do Lucide. Para usar um ícone novo no conteúdo, adicione a chave aqui.
 */
const brands: Record<string, string> = {
  databricks: siDatabricks.path,
  python: siPython.path,
  spark: siApachespark.path,
  airflow: siApacheairflow.path,
  gcp: siGooglecloud.path,
  javascript: siJavascript.path,
  html: siHtml5.path,
  css: siCss.path,
  git: siGit.path,
  github: siGithub.path,
  githubactions: siGithubactions.path,
  node: siNodedotjs.path,
  mediapipe: siMediapipe.path,
  scikitlearn: siScikitlearn.path,
  pandas: siPandas.path,
  numpy: siNumpy.path,
  mlflow: siMlflow.path,
  jupyter: siJupyter.path,
  // O Google Data Studio saiu do Simple Icons: glifo de uma versão anterior (CC0).
  datastudio:
    'M19.197 23.002c-1.016-.613-1.697-1.728-1.697-3 0-1.273.681-2.388 1.697-3h-6.909a3.034 3.034 0 0 0-.252-.011c-1.656 0-3.022 1.355-3.036 3.011v.014c0 1.645 1.354 3 3 3 .096 0 .192-.005.288-.014h6.909Zm1.803-6c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3Zm-10.803-2.004c-1.016-.613-1.697-1.728-1.697-3 0-1.273.681-2.388 1.697-3H3.288a3.034 3.034 0 0 0-.252-.011C1.38 8.987.014 10.342 0 11.998v.014c0 1.645 1.354 3 3 3 .096 0 .192-.005.288-.014h6.909Zm1.803-6c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3Zm7.197-2.004c-1.016-.613-1.697-1.728-1.697-3 0-1.273.681-2.388 1.697-3h-6.909c-.08-.006-.16-.01-.24-.01C10.39.984 9.021 2.336 9 3.994v.014c0 1.645 1.354 3 3 3 .096 0 .192-.005.288-.014h6.909Zm1.803-6c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3Z',
  // O LinkedIn não está mais no Simple Icons: glifo desenhado à mão.
  linkedin:
    'M4.5 2.5h15a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2Zm1.6 7.2v8h2.5v-8H6.1Zm1.25-1.1a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9Zm3.05 1.1v8h2.5v-4.3c0-1.1.6-1.8 1.5-1.8s1.3.6 1.3 1.8v4.3h2.5v-4.9c0-2.2-1.1-3.4-3-3.4-1 0-1.8.5-2.3 1.2V9.7h-2.5Z',
};

const lucide: Record<string, LucideIcon> = {
  database: Database,
  chart: ChartColumn,
  layers: Layers,
  factory: Factory,
  cloud: Cloud,
  workflow: Workflow,
  repeat: Repeat,
  activity: Activity,
  image: ImageIcon,
  gamepad: Gamepad2,
  graduation: GraduationCap,
  headphones: Headphones,
  film: Clapperboard,
  book: BookOpen,
  dumbbell: Dumbbell,
  scale: Scale,
  newspaper: Newspaper,
  flame: Flame,
  timer: Timer,
  wrench: Wrench,
  user: UserRound,
  mail: Mail,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Ícone decorativo: sempre com aria-hidden. O texto ao lado dá o significado. */
export function Icon({ name, size = 18, className }: IconProps) {
  const path = brands[name];
  if (path) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        fillRule={name === 'linkedin' ? 'evenodd' : undefined}
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d={path} />
      </svg>
    );
  }
  const Component = lucide[name] ?? Sparkles;
  return <Component size={size} aria-hidden="true" focusable="false" className={className} />;
}
