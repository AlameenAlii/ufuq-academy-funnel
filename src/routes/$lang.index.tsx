// Course landing page: the whole sales argument on one scroll, ending in the
// registration CTA. Seats and price come from the demo store so the admin
// screen can change them live.

import { Link, createFileRoute } from "@tanstack/react-router";

import { TactileLink } from "@/components/tactile-button";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  FileBarChart,
  GraduationCap,
  Languages,
  LayoutTemplate,
  MessageCircle,
  MonitorPlay,
  Quote,
  Rocket,
  Target,
  Users,
  Video,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

import { CohortCard } from "@/components/funnel/cohort-card";
import { useDemoStore } from "@/components/funnel/use-demo-store";
import { SarSuffix } from "@/components/saudi-riyal";
import { Ltr } from "@/components/site-chrome";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  attendanceLabel,
  course,
  courseLanguageLabel,
  firstBookableCohort,
  formatPrice,
  instructorBio,
  instructorCredentials,
  instructorName,
  instructorRole,
} from "@/lib/course";
import { dict, fill, pagePath, useDict, useLang, type Lang } from "@/lib/i18n";
import { images } from "@/lib/images";
import {
  courseJsonLd,
  faqJsonLd,
  organizationJsonLd,
  seoLinks,
  seoMeta,
  seoScripts,
  webPageJsonLd,
} from "@/lib/seo";
import { generalRequestUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang = (params.lang === "en" ? "en" : "ar") as Lang;
    const d = dict(lang);
    const faqItems = Object.values(d.home.faq.items).map((item) => ({
      q: item.q,
      a: item.a,
    }));

    return {
      meta: seoMeta({
        lang,
        title: d.home.meta.title,
        description: d.home.meta.description,
        path: pagePath(lang, "home"),
        imageAlt: d.home.hero.imageAlt,
      }),
      links: seoLinks("home", lang),
      scripts: seoScripts([
        webPageJsonLd({
          lang,
          key: "home",
          title: d.home.meta.title,
          description: d.home.meta.description,
        }),
        organizationJsonLd(lang),
        courseJsonLd({
          lang,
          name: d.register.summary.courseName,
          description: d.home.meta.description,
          priceSar: course.priceSar,
        }),
        faqJsonLd(faqItems),
      ]),
    };
  },
  component: CoursePage,
});

const MARK_ICONS = [Video, Target, GraduationCap, MessageCircle] as const;
const OUTCOME_ICONS = [LayoutTemplate, Rocket, FileBarChart, BadgeCheck] as const;

function SectionHeading({
  eyebrow,
  title,
  lead,
  onDark = false,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  onDark?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <p className={`eyebrow ${onDark ? "text-gold-soft" : ""}`}>{eyebrow}</p>
      <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[2.1rem]">{title}</h2>
      {lead && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            onDark ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

function CoursePage() {
  const lang = useLang();
  const d = useDict();
  const isRtl = lang === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const { cohorts, priceSar } = useDemoStore();
  const nextCohort = firstBookableCohort(cohorts) ?? cohorts[0];
  const registerPath = pagePath(lang, "register");

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="wash-ink grid-lines relative overflow-hidden">
        <div className="shell grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="animate-rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
              {d.home.hero.eyebrow}
            </span>

            <h1 className="hero-title mt-6 text-3xl leading-tight sm:text-4xl lg:text-[3.1rem] lg:leading-[1.12]">
              {d.home.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              {d.home.hero.lead}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <TactileLink to={registerPath} tone="gold">
                {d.home.hero.ctaPrimary}
                <Arrow className="h-4 w-4" aria-hidden="true" />
              </TactileLink>
              <a href="#curriculum" className="btn btn-ghost-light">
                {d.home.hero.ctaSecondary}
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 border-t border-white/12 pt-7 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-white/50">{d.home.hero.nextStart}</dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  {nextCohort?.monthLabel[lang]}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-white/50">{d.home.hero.priceLabel}</dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  <span className="tabular">{formatPrice(priceSar)}</span> <SarSuffix lang={lang} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-white/50">{d.home.details.duration}</dt>
                <dd className="mt-1 text-sm font-semibold text-white">
                  <span className="tabular">{course.weeks}</span> {d.common.weeks} ·{" "}
                  <span className="tabular">{course.sessions}</span> {d.common.sessions}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/12 shadow-[0_24px_60px_rgb(0_0_0/0.35)]">
              <img
                src={images.hero}
                alt={d.home.hero.imageAlt}
                width={1200}
                height={900}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="card-raised absolute -bottom-6 start-6 flex items-center gap-3 rounded-xl px-4 py-3 sm:start-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Users className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-foreground">{d.home.hero.trust}</span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- marks */}
      <section className="border-b border-border bg-background">
        <div className="shell grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[d.home.marks.live, d.home.marks.practical, d.home.marks.certificate, d.home.marks.support].map(
            (label, index) => {
              const Icon = MARK_ICONS[index];
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-foreground/85">{label}</span>
                </div>
              );
            },
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ outcomes */}
      <section className="section wash-sand">
        <div className="shell">
          <SectionHeading
            eyebrow={d.home.outcomes.eyebrow}
            title={d.home.outcomes.title}
            lead={d.home.outcomes.lead}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {Object.values(d.home.outcomes.items).map((item, index) => {
              const Icon = OUTCOME_ICONS[index];
              return (
                <article key={item.title} className="card-raised p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- curriculum */}
      <section id="curriculum" className="section scroll-mt-24">
        <div className="shell">
          <SectionHeading
            eyebrow={d.home.curriculum.eyebrow}
            title={d.home.curriculum.title}
            lead={d.home.curriculum.lead}
          />
          <ol className="mt-10 grid gap-4 lg:grid-cols-2">
            {Object.values(d.home.curriculum.items).map((item, index) => (
              <li key={item.title} className="card-soft flex gap-4 p-5 sm:p-6">
                <span className="tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/8 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-foreground">
                    {fill(d.home.curriculum.weekLabel, { COUNT: index + 1 })}
                  </p>
                  <h3 className="mt-1.5 text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {item.points.map((point) => (
                      <li key={point} className="pill-neutral">
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {d.home.curriculum.sessionsLabel}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------- instructor */}
      <section id="instructor" className="section-tight scroll-mt-24 wash-sand">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-border">
            <img
              src={images.instructor}
              alt={d.home.instructor.imageAlt}
              width={900}
              height={1100}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">{d.home.instructor.eyebrow}</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">{d.home.instructor.title}</h2>
            <p className="mt-6 text-lg font-semibold text-primary-deep">{instructorName(lang)}</p>
            <p className="text-sm text-muted-foreground">{instructorRole(lang)}</p>
            <p className="mt-4 text-base leading-relaxed text-foreground/80">
              {instructorBio(lang)}
            </p>
            <ul className="mt-6 grid gap-2.5">
              {instructorCredentials(lang).map((credential) => (
                <li key={credential} className="flex items-center gap-2.5 text-sm text-foreground/80">
                  <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  {credential}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- details */}
      <section className="section">
        <div className="shell">
          <SectionHeading eyebrow={d.home.details.eyebrow} title={d.home.details.title} />
          <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, label: d.home.details.duration, value: d.home.details.durationValue },
              { icon: MonitorPlay, label: d.home.details.attendance, value: attendanceLabel(lang) },
              {
                icon: CalendarDays,
                label: d.home.details.schedule,
                value: nextCohort?.scheduleLabel[lang] ?? "",
              },
              { icon: Languages, label: d.home.details.language, value: courseLanguageLabel(lang) },
              { icon: Target, label: d.home.details.level, value: d.home.details.levelValue },
              { icon: Video, label: d.home.details.recordings, value: d.home.details.recordingsValue },
              {
                icon: GraduationCap,
                label: d.home.details.certificate,
                value: d.home.details.certificateValue,
              },
              { icon: Users, label: d.home.details.seats, value: d.home.details.seatsValue },
            ].map((row) => (
              <div key={row.label} className="bg-card p-5">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <row.icon className="h-4 w-4 text-gold" aria-hidden="true" />
                  {row.label}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-foreground/85">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------- cohorts */}
      <section id="cohorts" className="section scroll-mt-24 wash-sand">
        <div className="shell">
          <SectionHeading
            eyebrow={d.home.cohorts.eyebrow}
            title={d.home.cohorts.title}
            lead={d.home.cohorts.lead}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cohorts.map((cohort) => (
              <CohortCard key={cohort.id} cohort={cohort} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- pricing */}
      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading eyebrow={d.home.pricing.eyebrow} title={d.home.pricing.title} />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {d.home.pricing.includes.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-7 rounded-xl bg-accent/70 p-4 text-sm leading-relaxed text-accent-foreground">
              {d.home.pricing.payment}
            </p>
          </div>

          <div className="card-raised p-7">
            <p className="text-sm text-muted-foreground">{d.register.summary.courseName}</p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="tabular font-display text-4xl font-semibold text-primary-deep">
                {formatPrice(priceSar)}
              </span>
              <span className="text-base font-semibold text-muted-foreground">
                <SarSuffix lang={lang} />
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{d.common.perSeat}</p>
            {priceSar < course.fullPriceSar && (
              <p className="mt-3 text-sm text-muted-foreground line-through">
                {d.home.pricing.was.split("%PRICE%")[0]}
                {formatPrice(course.fullPriceSar)} <SarSuffix lang={lang} />
              </p>
            )}
            <p className="pill-warning mt-4">{d.home.pricing.priceNote}</p>

            <TactileLink to={registerPath} tone="ink" className="mt-7 w-full">
              {d.home.pricing.cta}
              <Arrow className="h-4 w-4" aria-hidden="true" />
            </TactileLink>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {d.home.pricing.guarantee}
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- testimonials */}
      <section className="section-tight wash-sand">
        <div className="shell">
          <SectionHeading
            eyebrow={d.home.testimonials.eyebrow}
            title={d.home.testimonials.title}
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {Object.values(d.home.testimonials.items).map((item) => (
              <figure key={item.name} className="card-soft flex flex-col p-6">
                <Quote
                  className="h-6 w-6 text-gold-soft"
                  data-flip-rtl="true"
                  aria-hidden="true"
                />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- faq */}
      <section id="faq" className="section scroll-mt-24">
        <div className="shell-narrow">
          <SectionHeading eyebrow={d.home.faq.eyebrow} title={d.home.faq.title} />
          <Accordion type="single" collapsible className="mt-8 w-full">
            {Object.entries(d.home.faq.items).map(([key, item]) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-start text-base font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-8 text-sm text-muted-foreground">
            <a
              href={generalRequestUrl(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:text-gold"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {d.common.askOnWhatsapp}
            </a>
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- final cta */}
      <section className="wash-ink grid-lines">
        <div className="shell flex flex-col items-start gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl">
              {fill(d.home.finalCta.title, {
                DATE: nextCohort ? nextCohort.monthLabel[lang] : "",
              })}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/70">{d.home.finalCta.lead}</p>
            {nextCohort && (
              <p className="mt-4 text-sm text-white/60">
                <Ltr className="mono-ltr">{nextCohort.startDate}</Ltr>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <TactileLink to={registerPath} tone="gold">
              {d.home.finalCta.cta}
              <Arrow className="h-4 w-4" aria-hidden="true" />
            </TactileLink>
            <a
              href={generalRequestUrl(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost-light"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {d.home.finalCta.secondary}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
