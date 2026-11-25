// Locale layout. Every real page is a child of /:lang, so the locale is part of
// the URL, the document attributes and the SEO head — not hidden client state.

import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

import { MobileWhatsAppBar, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { applyHtmlLangAttrs, dirFor, isLang, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang")({
  // Unknown locale segments are a 404 rather than a silent fallback.
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
    return { lang: params.lang as Lang };
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams() as { lang: Lang };

  // Keep <html lang>/<html dir> correct during client navigation between locales.
  if (typeof document !== "undefined") {
    applyHtmlLangAttrs(lang);
  }

  return (
    <div dir={dirFor(lang)} className="flex min-h-screen flex-col bg-background pb-mobile-bar">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileWhatsAppBar />
    </div>
  );
}
