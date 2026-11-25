// Site chrome: header with in-page navigation, language switcher, mobile
// drawer, the sticky mobile enroll bar, and the footer.

import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";
import { TactileLink } from "@/components/tactile-button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useEffect, useState } from "react";

import {
  brand,
  contact,
  legalLines,
  locationLine,
  mailHref,
  responseHours,
} from "@/lib/company";
import {
  LANG_NAMES,
  applyHtmlLangAttrs,
  applyRouteLang,
  equivalentPath,
  otherLang,
  pagePath,
  useDict,
  useLang,
  usePathname,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { generalRequestUrl } from "@/lib/whatsapp";

/** Keeps Latin/numeric runs (phone numbers, IBANs) correct inside RTL text. */
export function Ltr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  );
}

/** Syncs `lang`/`dir` on the client after hydration. */
export function I18nDocAttrs() {
  const lang = useLang();
  useEffect(() => {
    applyRouteLang(lang);
  }, [lang]);
  return null;
}

/**
 * "ufuq" wordmark drawn inline as SVG:
 * no image request, crisp at any size, and it inherits the surrounding
 * colour so the same mark works on light (ink) and dark (white) surfaces.
 */
export function Logo({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "white";
  className?: string;
}) {
  const d = useDict();
  const onDark = variant === "white";

  return (
    <span
      className={cn(
        "inline-flex items-center",
        className,
        onDark ? "text-white" : "text-primary-deep",
      )}
      aria-label={d.brand.logoAlt}
      role="img"
    >
      <span aria-hidden="true" className="text-[30px] font-bold leading-none tracking-tight">ufuq</span>
    </span>
  );
}

/**
 * Language switch stays on the equivalent page: /en/register swaps to
 * /ar/register rather than dropping the visitor on the home page.
 */
export function LangSwitcher({ className }: { className?: string }) {
  const d = useDict();
  const lang = useLang();
  const pathname = usePathname();
  const navigate = useNavigate();
  const target = otherLang(lang);

  return (
    <button
      type="button"
      onClick={() => {
        applyRouteLang(target);
        applyHtmlLangAttrs(target);
        void navigate({ to: equivalentPath(pathname, target) });
      }}
      aria-label={d.nav.switchLanguage}
      title={d.nav.switchLanguage}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 ring-border transition hover:bg-muted",
        className,
      )}
    >
      {LANG_NAMES[target]}
    </button>
  );
}

/** In-page anchors on the course page, real routes elsewhere. */
const SECTIONS = ["curriculum", "instructor", "cohorts", "faq"] as const;

function sectionLabel(d: ReturnType<typeof useDict>, id: (typeof SECTIONS)[number]) {
  switch (id) {
    case "curriculum":
      return d.nav.curriculum;
    case "instructor":
      return d.nav.instructor;
    case "cohorts":
      return d.nav.dates;
    case "faq":
      return d.nav.faq;
  }
}

export function SiteHeader() {
  const d = useDict();
  const lang = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const homePath = pagePath(lang, "home");
  const onHome = pathname === homePath;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const sectionHref = (id: string) => (onHome ? `#${id}` : `${homePath}#${id}`);

  return (
    <>
      <a href="#main" className="skip-link">
        {d.common.skipToContent}
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-colors duration-300",
          scrolled
            ? "border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
            : "border-transparent bg-background",
        )}
      >
        <div className="shell flex h-[var(--header-height)] items-center justify-between gap-4">
          <Link
            to={homePath}
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <Logo />
          </Link>

          <nav aria-label={d.nav.menu} className="hidden items-center gap-1 lg:flex">
            {SECTIONS.map((id) => (
              <a
                key={id}
                href={sectionHref(id)}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/75 transition hover:bg-muted hover:text-foreground"
              >
                {sectionLabel(d, id)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LangSwitcher className="hidden sm:inline-flex" />
            <TactileLink
              to={pagePath(lang, "register")}
              tone="ink"
              className="hidden md:inline-flex"
            >
              {d.common.enrollNow}
            </TactileLink>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? d.nav.closeMenu : d.nav.toggleMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-border transition hover:bg-muted lg:hidden"
            >
              {open ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-0 z-40 lg:hidden"
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={d.nav.closeMenu}
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-basalt/45 backdrop-blur-sm"
        />
        <div className="absolute inset-x-0 top-[var(--header-height)] mx-3 overflow-hidden rounded-2xl bg-background p-4 shadow-xl ring-1 ring-border">
          <nav aria-label={d.nav.menu} className="flex flex-col">
            {SECTIONS.map((id) => (
              <a
                key={id}
                href={sectionHref(id)}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-foreground/85 transition hover:bg-muted"
              >
                {sectionLabel(d, id)}
              </a>
            ))}
            <Link
              to={pagePath(lang, "terms")}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base font-medium text-foreground/85 transition hover:bg-muted"
            >
              {d.nav.terms}
            </Link>
          </nav>
          <div className="mt-3 grid gap-2 border-t border-border pt-3">
            <Link
              to={pagePath(lang, "register")}
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              {d.common.enrollNow}
            </Link>
            <div className="flex items-center justify-between gap-2">
              <a
                href={generalRequestUrl(lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline flex-1"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {d.common.whatsapp}
              </a>
              <LangSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Sticky mobile action bar: enrolling is the primary action, WhatsApp is the
 * escape hatch. Pages clear it with `.pb-mobile-bar`.
 */
export function MobileWhatsAppBar() {
  const d = useDict();
  const lang = useLang();
  const pathname = usePathname();
  const registerPath = pagePath(lang, "register");
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  // The bar would only compete with the form on the registration screen.
  if (pathname === registerPath) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <Link to={registerPath} className="btn btn-primary flex-1">
        {d.common.enrollNow}
        <Arrow className="h-4 w-4" aria-hidden="true" />
      </Link>
      <a
        href={generalRequestUrl(lang)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={d.common.askOnWhatsapp}
        className="btn btn-outline w-12 px-0"
      >
        <WhatsAppIcon className="h-4 w-4" />
      </a>
    </div>
  );
}

export function SiteFooter() {
  const d = useDict();
  const lang = useLang();
  const year = new Date().getFullYear();
  const legal = legalLines(lang, {
    legalNameLabel: d.footer.legalNameLabel,
    unifiedNumberLabel: d.footer.unifiedNumberLabel,
    crLabel: d.footer.crLabel,
    vatLabel: d.footer.vatLabel,
  });

  return (
    <footer className="wash-ink grid-lines mt-16 text-white">
      <div className="shell py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo variant="white" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              {d.footer.tagline}
            </p>
            <a
              href={generalRequestUrl(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent mt-6"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              {d.footer.whatsappCta}
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-soft">
              {d.footer.linksTitle}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to={pagePath(lang, "home")}
                  className="text-white/75 transition hover:text-white"
                >
                  {d.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  to={pagePath(lang, "register")}
                  className="text-white/75 transition hover:text-white"
                >
                  {d.nav.register}
                </Link>
              </li>
              <li>
                <Link
                  to={pagePath(lang, "admin")}
                  className="text-white/75 transition hover:text-white"
                >
                  {d.nav.admin}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-soft">
              {d.footer.policiesTitle}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to={pagePath(lang, "terms")}
                  className="text-white/75 transition hover:text-white"
                >
                  {d.nav.terms}
                </Link>
              </li>
              <li>
                <Link
                  to={pagePath(lang, "privacy")}
                  className="text-white/75 transition hover:text-white"
                >
                  {d.nav.privacy}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-soft">
              {d.footer.contactTitle}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <a
                  href={generalRequestUrl(lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  {d.common.whatsapp}: <Ltr>{contact.whatsappDisplay}</Ltr>
                </a>
              </li>
              <li>
                <a href={mailHref} className="transition hover:text-white">
                  <Ltr>{contact.email}</Ltr>
                </a>
              </li>
              <li>{locationLine(lang)}</li>
              <li>
                {d.footer.hours}: {responseHours(lang)}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-soft">
            {d.footer.legalTitle}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-white/70">
            {legal.map((line) => (
              <li key={line.label}>
                {line.label}: <Ltr className="mono-ltr">{line.value}</Ltr>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white/70">{d.footer.paymentNote}</p>
          <p className="mt-2 text-sm text-white/55">{d.footer.demoNote}</p>
          <p className="mt-2 text-sm text-white/70">
            {d.footer.rights.replace("%YEAR%", String(year))}
          </p>
          <p className="sr-only">{brand.nameEn}</p>
        </div>
      </div>
    </footer>
  );
}
