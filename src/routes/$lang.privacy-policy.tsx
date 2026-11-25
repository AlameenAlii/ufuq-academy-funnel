// Privacy policy for the registration form, including a note that this build
// keeps everything in the visitor's browser.

import { Link, createFileRoute } from "@tanstack/react-router";

import { contact, mailHref } from "@/lib/company";
import { dict, pagePath, useDict, useLang, type Lang } from "@/lib/i18n";
import { breadcrumbJsonLd, seoLinks, seoMeta, seoScripts, webPageJsonLd } from "@/lib/seo";
import { generalRequestUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export const Route = createFileRoute("/$lang/privacy-policy")({
  head: ({ params }) => {
    const lang = (params.lang === "en" ? "en" : "ar") as Lang;
    const d = dict(lang);
    return {
      meta: seoMeta({
        lang,
        title: d.privacy.meta.title,
        description: d.privacy.meta.description,
        path: pagePath(lang, "privacy"),
        type: "article",
      }),
      links: seoLinks("privacy", lang),
      scripts: seoScripts([
        webPageJsonLd({
          lang,
          key: "privacy",
          title: d.privacy.meta.title,
          description: d.privacy.meta.description,
        }),
        breadcrumbJsonLd(lang, [
          { name: d.nav.home, key: "home" },
          { name: d.nav.privacy, key: "privacy" },
        ]),
      ]),
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const d = useDict();
  const lang = useLang();
  const sections = [
    d.privacy.sections.collect,
    d.privacy.sections.use,
    d.privacy.sections.sharing,
    d.privacy.sections.retention,
    d.privacy.sections.rights,
    d.privacy.sections.demo,
  ];

  return (
    <article className="section-tight">
      <div className="shell-narrow">
        <p className="eyebrow">{d.nav.privacy}</p>
        <h1 className="mt-3 text-2xl sm:text-3xl">{d.privacy.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{d.privacy.lead}</p>
        <p className="mt-2 text-sm text-muted-foreground">{d.privacy.updated}</p>
        <div className="rule-accent mt-8" />

        <div className="mt-10 space-y-10">
          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-xl">
                <span className="tabular text-gold">{index + 1}. </span>
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.body.map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="card-soft mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold text-primary-deep">{d.footer.contactTitle}</p>
            <a href={mailHref} className="mono-ltr text-sm text-muted-foreground hover:text-primary">
              {contact.email}
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={generalRequestUrl(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {d.common.whatsapp}
            </a>
            <Link to={pagePath(lang, "terms")} className="btn btn-outline">
              {d.nav.terms}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
