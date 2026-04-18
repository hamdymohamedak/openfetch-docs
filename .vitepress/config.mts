import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import {
  OPENFETCH_VERSION,
  OPENFETCH_VERSION_TAG,
} from "./openfetch-version";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Writes `public/llms.txt` from `llms.template.txt` so the shipped file tracks `openfetch-version.ts`. */
function openfetchLlmsFromTemplatePlugin() {
  return {
    name: "openfetch-llms-from-template",
    buildStart() {
      const templatePath = resolve(__dirname, "llms.template.txt");
      const outPath = resolve(__dirname, "../public/llms.txt");
      const tpl = readFileSync(templatePath, "utf8");
      const body = tpl
        .replaceAll("__OPENFETCH_VERSION_TAG__", OPENFETCH_VERSION_TAG)
        .replaceAll("__OPENFETCH_VERSION__", OPENFETCH_VERSION);
      writeFileSync(outPath, body);
    },
  };
}

type Lang = "ar" | "es" | "fa" | "fr" | "hi" | "it" | "ja" | "kr" | "ku";

const LANGS: Lang[] = ["ar", "es", "fa", "fr", "hi", "it", "ja", "kr", "ku"];

type NavLabels = {
  home: string;
  gettingStarted: string;
  httpMethods: string;
  frameworks: string;
  configuration: string;
  debugging: string;
  pluginsFluent: string;
  interceptors: string;
  architecture: string;
  featuresPipeline: string;
  retryCache: string;
  errorsSecurity: string;
};

const LABELS: Record<Lang, NavLabels> = {
  ar: {
    home: "نظرة عامة",
    gettingStarted: "البدء",
    httpMethods: "طرق HTTP",
    frameworks: "React و Vue",
    configuration: "الإعدادات",
    debugging: "التصحيح والمراقبة",
    pluginsFluent: "الإضافات والواجهة السلسة",
    interceptors: "المعترضات والوسيط",
    architecture: "البنية والداخلية",
    featuresPipeline: "الميزات ومسار الطلب",
    retryCache: "إعادة المحاولة والتخزين المؤقت",
    errorsSecurity: "الأخطاء والأمان",
  },
  es: {
    home: "Resumen",
    gettingStarted: "Primeros pasos",
    httpMethods: "Métodos HTTP",
    frameworks: "React y Vue",
    configuration: "Configuración",
    debugging: "Depuración",
    pluginsFluent: "Plugins y API fluida",
    interceptors: "Interceptores y middleware",
    architecture: "Arquitectura",
    featuresPipeline: "Funciones y pipeline",
    retryCache: "Reintentos y caché",
    errorsSecurity: "Errores y seguridad",
  },
  fa: {
    home: "نمای کلی",
    gettingStarted: "شروع سریع",
    httpMethods: "متدهای HTTP",
    frameworks: "React و Vue",
    configuration: "پیکربندی",
    debugging: "اشکال‌زدایی",
    pluginsFluent: "افزونه‌ها و API روان",
    interceptors: "قطع‌کننده‌ها و میان‌افزار",
    architecture: "معماری",
    featuresPipeline: "ویژگی‌ها و خط لوله",
    retryCache: "تلاش مجدد و حافظهٔ نهان",
    errorsSecurity: "خطا و امنیت",
  },
  fr: {
    home: "Aperçu",
    gettingStarted: "Démarrage",
    httpMethods: "Méthodes HTTP",
    frameworks: "React et Vue",
    configuration: "Configuration",
    debugging: "Débogage",
    pluginsFluent: "Plugins et API fluent",
    interceptors: "Intercepteurs et middleware",
    architecture: "Architecture",
    featuresPipeline: "Fonctionnalités et pipeline",
    retryCache: "Nouvelles tentatives et cache",
    errorsSecurity: "Erreurs et sécurité",
  },
  hi: {
    home: "अवलोकन",
    gettingStarted: "शुरुआत",
    httpMethods: "HTTP विधियाँ",
    frameworks: "React और Vue",
    configuration: "कॉन्फ़िगरेशन",
    debugging: "डीबगिंग",
    pluginsFluent: "प्लगइन और फ्लुएंट API",
    interceptors: "इंटरसेप्टर और मिडलवेयर",
    architecture: "Architecture",
    featuresPipeline: "Features और pipeline",
    retryCache: "रीट्राई और कैश",
    errorsSecurity: "त्रुटियाँ और सुरक्षा",
  },
  it: {
    home: "Panoramica",
    gettingStarted: "Introduzione",
    httpMethods: "Metodi HTTP",
    frameworks: "React e Vue",
    configuration: "Configurazione",
    debugging: "Debug",
    pluginsFluent: "Plugin e API fluent",
    interceptors: "Intercettori e middleware",
    architecture: "Architettura",
    featuresPipeline: "Funzionalità e pipeline",
    retryCache: "Retry e cache",
    errorsSecurity: "Errori e sicurezza",
  },
  ja: {
    home: "概要",
    gettingStarted: "はじめに",
    httpMethods: "HTTP メソッド",
    frameworks: "React と Vue",
    configuration: "設定",
    debugging: "デバッグ",
    pluginsFluent: "プラグインと Fluent API",
    interceptors: "インターセプターとミドルウェア",
    architecture: "アーキテクチャ",
    featuresPipeline: "機能とパイプライン",
    retryCache: "リトライとキャッシュ",
    errorsSecurity: "エラーとセキュリティ",
  },
  kr: {
    home: "개요",
    gettingStarted: "시작하기",
    httpMethods: "HTTP 메서드",
    frameworks: "React와 Vue",
    configuration: "설정",
    debugging: "디버깅",
    pluginsFluent: "플러그인과 Fluent API",
    interceptors: "인터셉터와 미들웨어",
    architecture: "아키텍처",
    featuresPipeline: "기능과 파이프라인",
    retryCache: "재시도와 캐시",
    errorsSecurity: "오류와 보안",
  },
  ku: {
    home: "Kurtebînî",
    gettingStarted: "Destpêk",
    httpMethods: "Rêbazên HTTP",
    frameworks: "React û Vue",
    configuration: "Veavakirin",
    debugging: "Debugging",
    pluginsFluent: "Plugin û Fluent API",
    interceptors: "Interceptors û middleware",
    architecture: "Mîmarî",
    featuresPipeline: "Taybetmendî û pipeline",
    retryCache: "Retry û cache",
    errorsSecurity: "Çewtî û ewlehî",
  },
};

const ROOT_LABELS: NavLabels = {
  home: "Overview",
  gettingStarted: "Getting started",
  httpMethods: "HTTP methods",
  frameworks: "React & Vue",
  configuration: "Configuration",
  debugging: "Debugging",
  pluginsFluent: "Plugins & fluent API",
  interceptors: "Interceptors & middleware",
  architecture: "Architecture & internals",
  featuresPipeline: "Features & pipeline",
  retryCache: "Retry & cache",
  errorsSecurity: "Errors & security",
};

const LANG_HOME_LABEL: Record<Lang, string> = {
  ar: "اللغات",
  es: "Idiomas",
  fa: "زبان‌ها",
  fr: "Langues",
  hi: "भाषाएँ",
  it: "Lingue",
  ja: "言語",
  kr: "언어",
  ku: "Ziman",
};

function sidebarRoot() {
  const L = ROOT_LABELS;
  return [
    {
      text: "openFetch",
      items: [
        { text: "Languages", link: "/languages/" },
        { text: L.home, link: "/" },
        { text: L.gettingStarted, link: "/getting-started" },
        { text: L.httpMethods, link: "/http-methods" },
        { text: L.frameworks, link: "/framework-guides" },
        { text: L.configuration, link: "/configuration" },
        { text: L.debugging, link: "/debugging" },
        { text: L.pluginsFluent, link: "/plugins-fluent" },
        { text: L.interceptors, link: "/interceptors-middleware" },
        { text: L.architecture, link: "/architecture" },
        { text: L.featuresPipeline, link: "/features-pipeline" },
        { text: L.retryCache, link: "/retry-cache" },
        { text: L.errorsSecurity, link: "/errors-security" },
        { text: "AI assistants & skills", link: "/skills" },
      ],
    },
  ];
}

function sidebarFor(lang: Lang) {
  const L = LABELS[lang];
  const p = `/${lang}`;
  const extended = lang === "ar";
  const architectureLink =
    lang === "ar" ? `${p}/architecture` : "/architecture";
  const pluginsFluentLink = "/plugins-fluent";
  const items: { text: string; link: string }[] = [
    { text: LANG_HOME_LABEL[lang], link: "/languages/" },
    { text: L.home, link: `${p}/` },
    { text: L.gettingStarted, link: `${p}/getting-started` },
  ];
  if (extended) {
    items.push(
      { text: L.httpMethods, link: `${p}/http-methods` },
      { text: L.frameworks, link: `${p}/framework-guides` },
    );
  }
  items.push(
    { text: L.configuration, link: `${p}/configuration` },
    { text: L.debugging, link: "/debugging" },
    { text: L.pluginsFluent, link: pluginsFluentLink },
    { text: L.interceptors, link: `${p}/interceptors-middleware` },
    { text: L.architecture, link: architectureLink },
    {
      text: L.featuresPipeline,
      link: lang === "ar" ? `${p}/features-pipeline` : "/features-pipeline",
    },
    { text: L.retryCache, link: `${p}/retry-cache` },
    { text: L.errorsSecurity, link: `${p}/errors-security` },
  );
  return [{ text: "openFetch", items }];
}

const localeConfigs = Object.fromEntries(
  LANGS.map((code) => {
    const langAttr =
      code === "kr" ? "ko" : code === "ku" ? "ku" : code;
    const label =
      code === "ar"
        ? "العربية"
        : code === "es"
          ? "Español"
          : code === "fa"
            ? "فارسی"
            : code === "fr"
              ? "Français"
              : code === "hi"
                ? "हिन्दी"
                : code === "it"
                  ? "Italiano"
                  : code === "ja"
                    ? "日本語"
                    : code === "kr"
                      ? "한국어 (kr)"
                      : "Kurdî";
    const entry: {
      label: string;
      lang: string;
      link: string;
      dir?: "ltr" | "rtl";
      titleTemplate?: string;
      themeConfig: {
        langMenuLabel: string;
        nav: { text: string; link: string }[];
        sidebar: ReturnType<typeof sidebarFor>;
        outline: { level: [number, number] };
      };
    } = {
      label,
      lang: langAttr,
      link: `/${code}/`,
      titleTemplate: ":title · openFetch",
      themeConfig: {
        langMenuLabel:
          code === "ar"
            ? "اللغة"
            : code === "fa"
              ? "زبان"
              : code === "ja"
                ? "言語"
                : code === "kr"
                  ? "언어"
                  : "Language",
        nav: [
          {
            text: LABELS[code].gettingStarted,
            link: `/${code}/getting-started`,
          },
        ],
        sidebar: sidebarFor(code),
        outline: { level: [2, 3] },
      },
    };
    if (code === "fa" || code === "ar") entry.dir = "rtl";
    return [code, entry];
  })
) as Record<
  string,
  {
    label: string;
    lang: string;
    link: string;
    dir?: "ltr" | "rtl";
    themeConfig: object;
  }
>;

/** Canonical production URL (no trailing slash); pair with `base` for absolute links in meta tags. */
const SITE_ORIGIN = "https://openfetch-js.github.io/openfetch-docs";

export default defineConfig({
  // GitHub Pages project site: https://openfetch-js.github.io/openfetch-docs/
  base: "/openfetch-docs/",
  vite: {
    plugins: [openfetchLlmsFromTemplatePlugin()],
  },
  title: "openFetch",
  titleTemplate: ":title · openFetch",
  description:
    "Fetch-native HTTP client for Node 18+, browsers, and edge: interceptors, composable middleware, retry, memory cache, typed errors — no XHR dependency.",
  srcExclude: ["README.md"],
  lastUpdated: true,
  head: [
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    ],
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap",
      },
    ],
    ["meta", { name: "theme-color", content: "#2563eb" }],
    ["meta", { name: "application-name", content: "openFetch" }],
    ["meta", { property: "og:site_name", content: "openFetch" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      {
        property: "og:image",
        content: `${SITE_ORIGIN}/openfetch-logo.jpg`,
      },
    ],
    ["meta", { property: "og:image:alt", content: "openFetch" }],
  ],
  themeConfig: {
    logo: {
      src: "/openfetch-logo.jpg",
      alt: "openFetch",
    },
    search: { provider: "local" },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/openfetch-js/OpenFetch",
        ariaLabel: "openFetch on GitHub",
      },
      {
        icon: "npm",
        link: "https://www.npmjs.com/package/@hamdymohamedak/openfetch",
        ariaLabel: "npm package @hamdymohamedak/openfetch",
      },
    ],
    footer: {
      message: "MIT · @hamdymohamedak/openfetch",
    },
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
      link: "/",
      themeConfig: {
        langMenuLabel: "Language",
        nav: [{ text: "Guide", link: "/getting-started" }],
        sidebar: sidebarRoot(),
        outline: { level: [2, 3] },
      },
    },
    ...localeConfigs,
  },
});
