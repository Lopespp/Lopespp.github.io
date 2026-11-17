import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { contents, isLang } from '../content';
import type { Content, Lang, TabId } from '../content/types';
import { useIsoLayoutEffect, usePrefersReducedMotion } from '../lib/hooks';
import { readStored, STORAGE_KEYS, writeStored } from '../lib/storage';
import { tabFromHash, TABS } from '../lib/tabs';

export type Theme = 'dark' | 'light';

interface Travel {
  id: number;
  from: TabId;
  to: TabId;
}

interface GoOptions {
  /** Rola até o conteúdo das abas se ele não estiver à vista. */
  scroll?: boolean;
  /** Não cria entrada no histórico (navegação vinda do botão voltar). */
  fromHistory?: boolean;
}

interface Toast {
  id: number;
  message: string;
}

interface AppState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Content;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Alterna o tema. Com `origin`, o tema novo se abre em círculo a partir desse elemento. */
  toggleTheme: (origin?: Element | null) => void;
  /** `false` no pré-render e na primeira renderização no navegador. */
  mounted: boolean;
  reducedMotion: boolean;
  /** Aba selecionada (o nó aceso do pipeline). */
  tab: TabId;
  /** Aba cujo conteúdo está na tela. Segue `tab` depois da animação do cano. */
  shownTab: TabId;
  /** `true` enquanto o conteúdo antigo sai, antes de o novo entrar. */
  leaving: boolean;
  travel: Travel | null;
  goToTab: (tab: TabId, options?: GoOptions) => void;
  nextTab: () => void;
  /** Abriu por link direto de aba: o hero não anima a entrada. */
  deepLinked: boolean;
  toasts: Toast[];
  /** Mostra um aviso. Dura 2s, ou `duration` ms para mensagens mais longas. */
  toast: (message: string, duration?: number) => void;
  overlay: 'summary' | 'terminal' | null;
  openOverlay: (overlay: 'summary' | 'terminal') => void;
  closeOverlay: () => void;
  cvUrl: string;
  pdfUrl: string;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp precisa estar dentro de <AppProvider>');
  return value;
}

/** Tempo entre o clique e a entrada do conteúdo novo: a viagem das partículas. */
const TRAVEL_MS = 500;
const REDUCED_MS = 150;

const base = import.meta.env.BASE_URL;

export function AppProvider({ initialLang, children }: { initialLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabId>('bronze');
  const [shownTab, setShownTab] = useState<TabId>('bronze');
  const [leaving, setLeaving] = useState(false);
  const [travel, setTravel] = useState<Travel | null>(null);
  const [deepLinked, setDeepLinked] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [overlay, setOverlay] = useState<'summary' | 'terminal' | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const tabRef = useRef(tab);
  tabRef.current = tab;
  const swapTimer = useRef<number | undefined>(undefined);
  const counter = useRef(0);
  const t = contents[lang];

  // Estado real do navegador, aplicado antes da primeira pintura.
  useIsoLayoutEffect(() => {
    const root = document.documentElement;
    const initialTheme = root.dataset.theme === 'light' ? 'light' : 'dark';
    const initialTab = tabFromHash(window.location.hash);
    setThemeState(initialTheme);
    if (initialTab) {
      setTab(initialTab);
      setShownTab(initialTab);
      setDeepLinked(true);
    }
    setMounted(true);
    root.classList.add('hydrated');
    root.classList.remove('lang-pending');
  }, [initialLang]);

  useIsoLayoutEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.lang = t.htmlLang;
    root.dataset.theme = theme;
    root.dataset.tab = tab;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0B0D10' : '#F7F6F3');
  }, [mounted, t, theme, tab]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeStored(STORAGE_KEYS.lang, next);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStored(STORAGE_KEYS.theme, next);
  }, []);

  const toggleTheme = useCallback((origin?: Element | null) => {
    const apply = () =>
      setThemeState((current) => {
        const next = current === 'dark' ? 'light' : 'dark';
        writeStored(STORAGE_KEYS.theme, next);
        return next;
      });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!origin || reduce || typeof document.startViewTransition !== 'function') {
      apply();
      return;
    }
    // O tema novo cresce em círculo a partir do botão (View Transitions API).
    const rect = origin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => flushSync(apply));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
        );
      })
      .catch(() => {});
  }, []);

  const scrollToContent = useCallback(() => {
    const target = document.getElementById('pipeline-anchor');
    if (!target) return;
    const top = target.getBoundingClientRect().top;
    const header = 64;
    const visible = top >= header - 4 && top < window.innerHeight * 0.45;
    if (visible) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: window.scrollY + top - header - 8, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  const goToTab = useCallback(
    (next: TabId, options: GoOptions = {}) => {
      const current = tabRef.current;
      if (next !== current) {
        if (!options.fromHistory) window.history.pushState(null, '', `#${next}`);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        counter.current += 1;
        setTab(next);
        setLeaving(true);
        setTravel(reduce ? null : { id: counter.current, from: current, to: next });
        window.clearTimeout(swapTimer.current);
        swapTimer.current = window.setTimeout(
          () => {
            setShownTab(next);
            setLeaving(false);
          },
          reduce ? REDUCED_MS : TRAVEL_MS,
        );
      }
      if (options.scroll) scrollToContent();
    },
    [scrollToContent],
  );

  const nextTab = useCallback(() => {
    const index = TABS.indexOf(tabRef.current);
    goToTab(TABS[(index + 1) % TABS.length], { scroll: true });
  }, [goToTab]);

  // Botão voltar/avançar e hash digitado na barra de endereço.
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash;
      const next = tabFromHash(hash);
      // Âncoras que não são abas (como a do link "pular para o conteúdo") não mexem no pipeline.
      if (!next && hash.length > 1) return;
      goToTab(next ?? 'bronze', { fromHistory: true });
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, [goToTab]);

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  const toast = useCallback((message: string, duration = 2000) => {
    counter.current += 1;
    const id = counter.current;
    setToasts((list) => [...list.slice(-2), { id, message }]);
    window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), duration);
  }, []);

  const openOverlay = useCallback((next: 'summary' | 'terminal') => setOverlay(next), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      t,
      theme,
      setTheme,
      toggleTheme,
      mounted,
      reducedMotion,
      tab,
      shownTab,
      leaving,
      travel,
      goToTab,
      nextTab,
      deepLinked,
      toasts,
      toast,
      overlay,
      openOverlay,
      closeOverlay,
      cvUrl: `${base}cv.html?lang=${lang}`,
      pdfUrl: `${base}${t.cv.pdfFile}`,
    }),
    [
      lang,
      setLang,
      t,
      theme,
      setTheme,
      toggleTheme,
      mounted,
      reducedMotion,
      tab,
      shownTab,
      leaving,
      travel,
      goToTab,
      nextTab,
      deepLinked,
      toasts,
      toast,
      overlay,
      openOverlay,
      closeOverlay,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Idioma salvo ou pedido por `?lang=`. `null` quando não há escolha. */
export function storedLang(): Lang | null {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromUrl)) {
    writeStored(STORAGE_KEYS.lang, fromUrl);
    return fromUrl;
  }
  const saved = readStored(STORAGE_KEYS.lang);
  return isLang(saved) ? saved : null;
}
