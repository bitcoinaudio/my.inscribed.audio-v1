export type ThemeMode = "dark" | "light";

type Palette = {
  background?: string;
  surface?: string;
  text?: string;
  border?: string;
  accent?: string;
};

type SiteTheme = {
  accent?: string;
};

export type ThemeConfig = {
  defaultMode?: ThemeMode;
  allowUserOverride?: boolean;
  modes?: {
    dark?: Palette;
    light?: Palette;
  };
  sites?: {
    myinscribed?: SiteTheme;
  };
};

const DEFAULT_THEME_URL = "";

function setVar(name: string, value?: string) {
  if (!value) return;
  document.documentElement.style.setProperty(name, value);
}

export function applyThemeConfig(config: ThemeConfig) {
  const dark = config.modes?.dark;
  const light = config.modes?.light;
  const siteAccent = config.sites?.myinscribed?.accent;

  setVar("--theme-dark-bg", dark?.background);
  setVar("--theme-dark-surface", dark?.surface);
  setVar("--theme-dark-text", dark?.text);
  setVar("--theme-dark-border", dark?.border);
  setVar("--theme-dark-accent", dark?.accent);

  setVar("--theme-light-bg", light?.background);
  setVar("--theme-light-surface", light?.surface);
  setVar("--theme-light-text", light?.text);
  setVar("--theme-light-border", light?.border);
  setVar("--theme-light-accent", light?.accent);

  setVar("--site-accent", siteAccent);
}

export async function loadAdminThemeConfig(): Promise<ThemeConfig | null> {
  const configuredUrl = import.meta.env.VITE_THEME_CONFIG_URL;
  const themeUrl = configuredUrl || DEFAULT_THEME_URL;

  if (!themeUrl) return null;

  try {
    const response = await fetch(themeUrl, { cache: "no-store" });
    if (!response.ok) return null;
    const parsed = (await response.json()) as ThemeConfig;
    return parsed;
  } catch {
    return null;
  }
}

export function resolveInitialTheme(config: ThemeConfig | null): ThemeMode {
  const saved = localStorage.getItem("myinscribed-theme-mode") ?? localStorage.getItem("theme");
  const hasSaved = saved === "light" || saved === "dark";

  if (!config) {
    return hasSaved ? (saved as ThemeMode) : "dark";
  }

  const allowUserOverride = config.allowUserOverride !== false;

  if (allowUserOverride && hasSaved) {
    return saved as ThemeMode;
  }

  return config.defaultMode === "light" ? "light" : "dark";
}
