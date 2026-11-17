import type { Profile, Skill } from './types';

/** Dados iguais em todos os idiomas. */
export const profile: Profile = {
  name: 'Pietro Lopes Ramos',
  city: 'Matão, SP',
  email: 'rlopespietro@gmail.com',
  linkedin: 'https://www.linkedin.com/in/pietro-lopes-7b8b102b6',
  github: 'https://github.com/Lopespp',
  githubHandle: 'Lopespp',
  employer: 'Programmers',
  university: 'Uniara',
};

export const handyBird = {
  play: 'https://handy-bird.netlify.app/',
  code: 'https://github.com/Lopespp/Handy-Bird',
  image: 'handy-bird/preview',
  mascot: 'handy-bird/handy',
  tags: ['JavaScript', 'Phaser 3', 'MediaPipe', 'Web Worker', 'Playwright', 'GitHub Actions', 'Netlify'],
  stack: ['javascript', 'mediapipe', 'git', 'github', 'githubactions'],
};

/** Carteira oficial de credenciais. */
export const wallets = {
  databricks: 'https://credentials.databricks.com/profile/pietro-lopes-ramos/wallet',
};

/** Imagens das badges, em public/badges (sem extensão). */
export const badgeImages = {
  associate: 'badges/data-engineer-associate',
  agentEvaluation: 'badges/delivery-expert-agent-evaluation',
  sqlMigration: 'badges/delivery-expert-sql-migration',
  lakehouseBuild: 'badges/delivery-expert-lakehouse-build',
  lakeflowPipelines: 'badges/lakeflow-declarative-pipelines',
};

type SharedSkill = Omit<Skill, 'name' | 'detail' | 'note'> & { name?: string };

/**
 * Skills cujo nome é igual nos dois idiomas. As que mudam de nome (ou têm
 * complemento) recebem `name`/`detail` em pt.ts e en.ts, pelo `id`.
 */
export const skillBase: SharedSkill[] = [
  { id: 'databricks', name: 'Databricks', icon: 'databricks', group: 'data', daily: true },
  { id: 'spark', name: 'Apache Spark', icon: 'spark', group: 'data' },
  { id: 'airflow', name: 'Apache Airflow', icon: 'airflow', group: 'data' },
  { id: 'azure', name: 'Microsoft Azure', icon: 'cloud', group: 'data' },
  { id: 'fabric', name: 'Microsoft Fabric', icon: 'factory', group: 'data' },
  { id: 'gcp', name: 'Google Cloud', icon: 'gcp', group: 'data' },

  { id: 'medallion', icon: 'layers', group: 'engineering', daily: true },
  { id: 'pipelines', icon: 'workflow', group: 'engineering' },
  { id: 'incremental', icon: 'repeat', group: 'engineering' },
  { id: 'streaming', icon: 'activity', group: 'engineering' },

  { id: 'python', name: 'Python', icon: 'python', group: 'languages', daily: true },
  { id: 'sql', name: 'SQL', icon: 'database', group: 'languages', daily: true },
  { id: 'pyspark', name: 'PySpark', icon: 'spark', group: 'languages', daily: true },
  { id: 'javascript', name: 'JavaScript', icon: 'javascript', group: 'languages' },
  { id: 'html', name: 'HTML5', icon: 'html', group: 'languages' },
  { id: 'css', name: 'CSS', icon: 'css', group: 'languages' },

  { id: 'pandas', name: 'Pandas', icon: 'pandas', group: 'ml' },
  { id: 'numpy', name: 'NumPy', icon: 'numpy', group: 'ml' },
  { id: 'mlflow', name: 'MLflow', icon: 'mlflow', group: 'ml' },
  { id: 'mediapipe', name: 'MediaPipe', icon: 'mediapipe', group: 'ml' },
  { id: 'jupyter', name: 'Jupyter', icon: 'jupyter', group: 'ml' },

  { id: 'powerbi', name: 'Power BI', icon: 'chart', group: 'bi', daily: true },
  { id: 'datastudio', name: 'Google Data Studio', icon: 'datastudio', group: 'bi' },

  { id: 'git', name: 'Git', icon: 'git', group: 'tools', daily: true },
  { id: 'github', name: 'GitHub', icon: 'github', group: 'tools', daily: true },
  { id: 'githubactions', name: 'GitHub Actions', icon: 'githubactions', group: 'tools' },
  { id: 'node', name: 'Node.js', icon: 'node', group: 'tools' },
  { id: 'photoshop', name: 'Photoshop', icon: 'image', group: 'tools' },
];

/** Monta a lista de skills de um idioma a partir da base e dos textos traduzidos. */
export function buildSkills(texts: Record<string, { name?: string; detail?: string; note?: string }>): Skill[] {
  return skillBase.map((skill) => {
    const text = texts[skill.id] ?? {};
    return { ...skill, ...text, name: text.name ?? skill.name ?? skill.id };
  });
}
