import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

import { I18nDocAttrs } from "@/components/site-chrome";
import { DEFAULT_LANG, LANG_TAGS, dirFor, useDict, useLang } from "@/lib/i18n";
import ar from "@/lib/i18n/ar";
import { organizationJsonLd, seoLinks, seoMeta, seoScripts } from "@/lib/seo";
import { generalRequestUrl } from "@/lib/whatsapp";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  const d = useDict();
  const lang = useLang();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="tabular font-display text-[5rem] font-semibold leading-none text-primary">
          {d.root.notFound.code}
        </p>
        <h1 className="mt-4 text-xl font-semibold text-foreground">{d.root.notFound.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {d.root.notFound.lead}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <a href={`/${lang}`} className="btn btn-primary">
            {d.root.notFound.home}
          </a>
          <a
            href={generalRequestUrl(lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            {d.common.whatsapp}
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const d = useDict();
  const lang = useLang();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {d.root.error.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.root.error.lead}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn btn-primary"
          >
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
            {d.root.error.retry}
          </button>
          <a href={`/${lang}`} className="btn btn-outline">
            {d.root.error.home}
          </a>
          <a
            href={generalRequestUrl(lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            {d.common.whatsapp}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#131A33" },
      // Route-level heads override these with their own localized meta.
      ...seoMeta({
        lang: DEFAULT_LANG,
        title: ar.home.meta.title,
        description: ar.home.meta.description,
        path: "/ar",
      }),
    ],
    links: [
      ...seoLinks("home", DEFAULT_LANG),
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      // Arabic runs on self-hosted Noto Kufi Arabic (see styles.css), so it is
      // preloaded rather than fetched from a CDN.
      {
        rel: "preload",
        as: "font",
        type: "font/ttf",
        href: "/fonts/NotoKufiArabic-Variable.ttf",
        crossOrigin: "anonymous",
      },
      // Inter carries the Latin side and IBM Plex Mono the IBAN/reference strings.
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: seoScripts([organizationJsonLd(DEFAULT_LANG)]),
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * The document shell renders before the active locale is known on the client,
 * so it ships the default locale (Arabic); `I18nDocAttrs` re-syncs `lang`/`dir`
 * from the route after hydration.
 */
function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang={LANG_TAGS[DEFAULT_LANG]} dir={dirFor(DEFAULT_LANG)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nDocAttrs />
      <Outlet />
    </QueryClientProvider>
  );
}
