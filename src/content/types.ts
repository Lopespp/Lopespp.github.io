/**
 * Formato do conteúdo do site. `pt.ts` e `en.ts` exportam um objeto deste tipo.
 * Textos aceitam **negrito** com dois asteriscos.
 */

export type Lang = 'pt' | 'en';
export type TabId = 'bronze' | 'silver' | 'gold' | 'contato';
export type SkillGroup = 'data' | 'engineering' | 'languages' | 'ml' | 'bi' | 'tools';

/** Dados que não mudam com o idioma. */
export interface Profile {
  name: string;
  city: string;
  email: string;
  linkedin: string;
  github: string;
  githubHandle: string;
  employer: string;
  university: string;
}

export interface Skill {
  /** Identificador usado no campo `stack` de projetos, experiências e entregas. */
  id: string;
  name: string;
  /** Complemento curto exibido abaixo do nome. */
  detail?: string;
  /** Chave de ícone (ver src/lib/icons.tsx). Chave desconhecida vira um ícone genérico. */
  icon: string;
  /** Área em que a skill aparece. */
  group: SkillGroup;
  /** Marca a skill como de uso no dia a dia. */
  daily?: boolean;
  /** Texto fixo do popover. Aparece junto da lista "onde usei" gerada pelo `stack`. */
  note?: string;
}

/** Certificação ou badge com imagem. */
export interface Credential {
  /** Caminho em public/, sem extensão (.webp e .png). */
  image: string;
  title: string;
  /** Tipo ou emissor, exibido acima do título. */
  kind: string;
}

export interface Delivery {
  icon: string;
  text: string;
  /** Nome curto que aparece no popover "onde usei" das skills. */
  short: string;
  /** Ids de skills usadas nesta entrega. */
  stack: string[];
}

export interface Experience {
  id: string;
  company: string;
  /** Complemento do nome da empresa, como o ramo. */
  companyNote?: string;
  role: string;
  period: string;
  summary: string;
  deliveriesTitle?: string;
  deliveries?: Delivery[];
  tags: string[];
  short: string;
  stack: string[];
}

export interface Project {
  id: string;
  name: string;
  label: string;
  description: string;
  /** Caminho em public/, sem extensão: o site procura .webp e .jpg. */
  image: string;
  imageAlt: string;
  /** Personagem animado no canto do card (caminho em public/, sem extensão: .webp e .png). */
  mascot?: string;
  tags: string[];
  short: string;
  stack: string[];
  primary: { label: string; url: string };
  secondary?: { label: string; url: string };
}

export interface TimelineItem {
  date: string;
  text: string;
  /** Item futuro: aparece tracejado, com o selo `badge`. */
  upcoming?: boolean;
  badge?: string;
}

export interface Content {
  lang: Lang;
  htmlLang: string;
  profile: Profile;
  meta: {
    title: string;
    description: string;
    ogTagline: string;
    jobTitle: string;
    /** Título da aba do navegador quando o visitante troca de aba. */
    awayTitle: string;
    consoleMessage: string;
  };
  ui: {
    /** Rótulo curto do botão de CV em telas estreitas. */
    cvShort: string;
    skipLink: string;
    downloadCv: string;
    languageToggle: string;
    languageNames: Record<Lang, string>;
    themeToDark: string;
    themeToLight: string;
    close: string;
    opensInNewTab: string;
    inProgress: string;
  };
  hero: {
    label: string;
    logs: string[];
    subtitle: string;
    personal: string;
    ctaProjects: string;
    ctaContact: string;
    photoAlt: string;
  };
  selector: {
    title: string;
    chips: { id: 'summary' | 'projects' | 'about' | 'contact'; icon: string; label: string }[];
  };
  summary: {
    /** Rótulo pequeno acima do nome. */
    title: string;
    items: { label: string; value: string }[];
    copyEmail: string;
    linkedin: string;
  };
  tabs: {
    listLabel: string;
    items: Record<TabId, { layer: string; label: string }>;
  };
  bronze: {
    title: string;
    bio: string[];
    timelineTitle: string;
    timeline: TimelineItem[];
    offCodeTitle: string;
    offCode: { icon: string; title: string }[];
  };
  silver: {
    title: string;
    skillsTitle: string;
    skillsHint: string;
    /** Legenda do marcador das skills de uso diário. */
    dailyLegend: string;
    groups: Record<SkillGroup, string>;
    skills: Skill[];
    whereUsed: string;
    educationTitle: string;
    education: {
      course: string;
      school: string;
      done: number;
      total: number;
      /** `{done}` e `{total}` são trocados pelos números acima. */
      progressLabel: string;
      expected: string;
    };
    /** Outras formações, uma linha cada. */
    educationOther: { title: string; detail: string }[];
    certsTitle: string;
    /** Certificação principal, em destaque. */
    certification: Credential & { text: string };
    badgesTitle: string;
    badgesText: string;
    badges: Credential[];
    /** Links para a carteira oficial de credenciais. */
    wallets: { label: string; url: string }[];
    coursesTitle: string;
    courses: { title: string; issuer: string; inProgress?: boolean }[];
    languagesTitle: string;
    languages: { name: string; level: string; note?: string }[];
  };
  gold: {
    title: string;
    featuredTitle: string;
    projects: Project[];
    experienceTitle: string;
    experiences: Experience[];
  };
  contact: {
    title: string;
    text: string;
    emailTitle: string;
    emailCopy: string;
    emailWrite: string;
    linkedinTitle: string;
    linkedinText: string;
    githubTitle: string;
    githubText: string;
    cvTitle: string;
    cvText: string;
    copied: string;
    copyFailed: string;
  };
  footer: {
    text: string;
    terminalHint: string;
    openTerminal: string;
    emailLabel: string;
    privacyTitle: string;
    privacy: string[];
  };
  terminal: {
    title: string;
    welcome: string[];
    inputLabel: string;
    status: string;
    commands: { name: string; description: string }[];
    whoami: string[];
    table: { field: string; value: string; rows: { field: string; value: string }[] };
    rowCount: string;
    skillsIntro: string;
    projectsIntro: string;
    certsIntro: string;
    playing: string;
    contactIntro: string;
    themeChanged: Record<'dark' | 'light', string>;
    langChanged: string;
    langUsage: string;
    /** `{cmd}` é trocado pelo comando digitado. */
    notFound: string;
  };
  hand: {
    button: string;
    title: string;
    explain: string;
    activate: string;
    notNow: string;
    loading: string;
    active: string;
    previewLabel: string;
    gestures: { emoji: string; text: string }[];
    stop: string;
    denied: string;
    unavailable: string;
    failed: string;
    turnedOff: string;
  };
  cv: {
    pageTitle: string;
    headline: string;
    summary: string;
    sections: {
      experience: string;
      project: string;
      education: string;
      certifications: string;
      courses: string;
      skills: string;
      languages: string;
    };
    print: string;
    downloadPdf: string;
    backToSite: string;
    switchLanguage: string;
    pdfFile: string;
  };
}
