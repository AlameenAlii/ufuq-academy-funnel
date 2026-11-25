// `/` is a locale resolver, not a page: it forwards to /en or /ar.
//
// During prerender there is no visitor, so the static output redirects to the
// default locale; on the client the stored/browser preference wins. Keeping the
// resolver separate means every real page lives under an addressable locale.

import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { DEFAULT_LANG, detectInitialLang, pagePath } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // SSR / prerender: send crawlers to the default locale immediately.
    if (typeof window === "undefined") {
      throw redirect({ to: pagePath(DEFAULT_LANG, "home"), replace: true });
    }
  },
  component: LocaleResolver,
});

function LocaleResolver() {
  const navigate = Route.useNavigate();

  useEffect(() => {
    void navigate({
      to: pagePath(detectInitialLang(), "home"),
      replace: true,
    });
  }, [navigate]);

  // Intentionally silent: no preloader, no flash of disclaimer copy.
  return <div className="min-h-screen bg-background" aria-hidden="true" />;
}
