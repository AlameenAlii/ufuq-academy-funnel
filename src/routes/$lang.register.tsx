// Registration funnel: cohort → details → bank transfer + receipt → review,
// ending in an "under review" confirmation. No account, no card, no gateway.

import { Link, createFileRoute } from "@tanstack/react-router";

import { TactileButton } from "@/components/tactile-button";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarPlus,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Info,
  Loader2,
  Paperclip,
  Pencil,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useMemo, useRef, useState } from "react";

import { CohortCard } from "@/components/funnel/cohort-card";
import { useDemoStore } from "@/components/funnel/use-demo-store";
import { SarSuffix } from "@/components/saudi-riyal";
import { Ltr } from "@/components/site-chrome";
import { accountName, bankName, payout } from "@/lib/company";
import {
  attendanceLabel,
  cohortById,
  formatPrice,
  isBookable,
  type Cohort,
} from "@/lib/course";
import { dict, fill, pagePath, useDict, useLang, type Lang } from "@/lib/i18n";
import { images } from "@/lib/images";
import {
  addRegistration,
  copyText,
  downloadIcs,
  formatBytes,
  readFileAsDataUrl,
  validateProof,
  type ProofFile,
  type Registration,
} from "@/lib/registration";
import { seoLinks, seoMeta, seoScripts, webPageJsonLd } from "@/lib/seo";
import { confirmationUrl, generalRequestUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/$lang/register")({
  head: ({ params }) => {
    const lang = (params.lang === "en" ? "en" : "ar") as Lang;
    const d = dict(lang);
    return {
      meta: seoMeta({
        lang,
        title: d.register.meta.title,
        description: d.register.meta.description,
        path: pagePath(lang, "register"),
      }),
      links: seoLinks("register", lang),
      scripts: seoScripts([
        webPageJsonLd({
          lang,
          key: "register",
          title: d.register.meta.title,
          description: d.register.meta.description,
        }),
      ]),
    };
  },
  component: RegisterPage,
});

type StepId = "cohort" | "details" | "payment" | "review";
const STEPS: StepId[] = ["cohort", "details", "payment", "review"];

type FieldErrors = Partial<Record<"cohort" | "name" | "phone" | "email" | "consent" | "proof", string>>;

const SAUDI_PHONE = /^(?:\+?966|0)?5\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Small copy-to-clipboard control used across the payment details table. */
function CopyButton({ value, label }: { value: string; label: string }) {
  const d = useDict();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(value);
        if (!ok) return;
        setDone(true);
        window.setTimeout(() => setDone(false), 1800);
      }}
      aria-label={`${d.common.copy}: ${label}`}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-foreground/75 transition hover:bg-muted"
    >
      {done ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {done ? d.common.copied : d.common.copy}
    </button>
  );
}

function Stepper({ current }: { current: number }) {
  const d = useDict();
  const labels: Record<StepId, string> = {
    cohort: d.register.steps.cohort,
    details: d.register.steps.details,
    payment: d.register.steps.payment,
    review: d.register.steps.review,
  };

  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`tabular flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-success text-white"
                  : active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={`text-sm ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {labels[step]}
            </span>
            {index < STEPS.length - 1 && (
              <span className="hidden h-px w-8 bg-border sm:block" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SummaryCard({
  cohort,
  priceSar,
}: {
  cohort: Cohort | undefined;
  priceSar: number;
}) {
  const d = useDict();
  const lang = useLang();

  const rows = [
    { label: d.register.summary.course, value: d.register.summary.courseName },
    {
      label: d.register.summary.cohort,
      value: cohort ? cohort.monthLabel[lang] : d.register.summary.notChosen,
    },
    {
      label: d.register.summary.starts,
      value: cohort ? cohort.startLabel[lang] : d.register.summary.notChosen,
    },
    {
      label: d.register.summary.schedule,
      value: cohort ? cohort.scheduleLabel[lang] : d.register.summary.notChosen,
    },
    { label: d.register.summary.attendance, value: attendanceLabel(lang) },
  ];

  return (
    // `self-start` keeps the card its natural height instead of stretching to
    // the form column, which is what lets it stick while the form scrolls.
    <aside className="card-raised p-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <h2 className="text-base font-semibold text-primary-deep">{d.register.summary.title}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-end font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">{d.register.summary.total}</span>
          <span className="tabular font-display text-2xl font-semibold text-primary-deep">
            {formatPrice(priceSar)}{" "}
            <span className="text-sm">
              <SarSuffix lang={lang} />
            </span>
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{d.register.summary.vat}</p>
      </div>
    </aside>
  );
}

function RegisterPage() {
  const lang = useLang();
  const d = useDict();
  const { cohorts, priceSar } = useDemoStore();
  const Forward = lang === "ar" ? ArrowLeft : ArrowRight;
  const Backward = lang === "ar" ? ArrowRight : ArrowLeft;

  const [stepIndex, setStepIndex] = useState(0);
  const [cohortId, setCohortId] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [proof, setProof] = useState<ProofFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const cohort = useMemo(
    () => (cohortId ? cohortById(cohortId, cohorts) : undefined),
    [cohortId, cohorts],
  );

  const transferBlock = [
    `${d.register.payment.bank}: ${bankName(lang)}`,
    `${d.register.payment.accountName}: ${accountName(lang)}`,
    `${d.register.payment.iban}: ${payout.ibanPretty}`,
    `${d.register.payment.swift}: ${payout.swift}`,
    `${d.register.payment.amount}: ${formatPrice(priceSar)} ${d.common.sar}`,
  ].join("\n");

  function attachSample() {
    setProof({
      name: "transfer-receipt.png",
      size: 268_400,
      type: "image/png",
      dataUrl: images.demoReceipt,
    });
    setErrors((prev) => ({ ...prev, proof: undefined }));
  }

  async function attachFile(file: File) {
    const problem = validateProof(file);
    if (problem) {
      setErrors((prev) => ({
        ...prev,
        proof:
          problem === "type"
            ? d.register.payment.upload.errors.type
            : d.register.payment.upload.errors.size,
      }));
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProof({ name: file.name, size: file.size, type: file.type, dataUrl });
      setErrors((prev) => ({ ...prev, proof: undefined }));
    } finally {
      setUploading(false);
    }
  }

  function validateStep(index: number): boolean {
    const next: FieldErrors = {};
    if (index === 0 && (!cohort || !isBookable(cohort))) {
      next.cohort = d.register.cohort.error;
    }
    if (index === 1) {
      if (fullName.trim().length < 3) next.name = d.register.details.errors.name;
      if (!SAUDI_PHONE.test(phone.replace(/[\s-]/g, ""))) {
        next.phone = d.register.details.errors.phone;
      }
      if (!EMAIL.test(email.trim())) next.email = d.register.details.errors.email;
      if (!consent) next.consent = d.register.details.errors.consent;
    }
    if (index === 2 && !proof) {
      next.proof = d.register.payment.upload.errors.missing;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(stepIndex)) return;
    setStepIndex((value) => Math.min(STEPS.length - 1, value + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors({});
    setStepIndex((value) => Math.max(0, value - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!cohort || !proof) return;
    setSubmitting(true);
    // Small delay so the submitting state is visible, as it would be with a real API.
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    const registration = addRegistration({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      cohortId: cohort.id,
      amountSar: priceSar,
      proof,
    });
    setSubmitting(false);
    setResult(registration);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ------------------------------------------------------------ success */
  if (result) {
    const successCohort = cohortById(result.cohortId, cohorts);
    const summaryText = [
      `${d.register.success.reference}: ${result.reference}`,
      `${d.register.summary.course}: ${d.register.summary.courseName}`,
      `${d.register.summary.cohort}: ${successCohort?.monthLabel[lang] ?? result.cohortId}`,
      `${d.register.summary.total}: ${formatPrice(result.amountSar)} ${d.common.sar}`,
      `${d.register.success.status}: ${d.register.success.statusValue}`,
    ].join("\n");

    return (
      <section className="section">
        <div className="shell-narrow">
          <div className="card-raised overflow-hidden">
            <div className="wash-ink grid-lines px-6 py-10 text-center sm:px-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {d.register.success.badge}
              </span>
              <h1 className="mt-5 text-2xl sm:text-3xl">
                {fill(d.register.success.title, { NAME: result.fullName })}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75">
                {d.register.success.lead}
              </p>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-2">
              <div className="bg-card p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {d.register.success.reference}
                </p>
                <p className="mono-ltr mt-2 text-lg font-semibold text-primary-deep">
                  {result.reference}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {d.register.success.keepReference}
                </p>
              </div>
              <div className="bg-card p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {d.register.success.status}
                </p>
                <p className="pill-warning mt-2">{d.register.success.statusValue}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {successCohort ? successCohort.startLabel[lang] : ""}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="text-base font-semibold text-primary-deep">
                {d.register.success.nextTitle}
              </h2>
              <ol className="mt-4 space-y-3">
                {d.register.success.next.map((line, index) => (
                  <li key={line} className="flex gap-3 text-sm text-foreground/80">
                    <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {index + 1}
                    </span>
                    {line}
                  </li>
                ))}
              </ol>

              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                <a
                  href={confirmationUrl(
                    {
                      reference: result.reference,
                      fullName: result.fullName,
                      cohortId: result.cohortId,
                      amountSar: result.amountSar,
                    },
                    lang,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {d.register.success.sendWhatsapp}
                </a>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    if (!successCohort) return;
                    downloadIcs({
                      filename: `${result.reference}.ics`,
                      title: d.register.summary.courseName,
                      description: `${d.register.success.reference}: ${result.reference}`,
                      startDate: successCohort.startDate,
                      endDate: successCohort.endDate,
                    });
                  }}
                >
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  {d.register.success.calendar}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={async () => {
                    const ok = await copyText(summaryText);
                    if (!ok) return;
                    setCopiedSummary(true);
                    window.setTimeout(() => setCopiedSummary(false), 1800);
                  }}
                >
                  {copiedSummary ? (
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedSummary ? d.common.copied : d.register.success.copySummary}
                </button>
                <Link to={pagePath(lang, "home")} className="btn btn-outline">
                  {d.common.backHome}
                </Link>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                {d.register.success.contactNote}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------------- funnel */
  return (
    <section className="section-tight">
      <div className="shell">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl">{d.register.title}</h1>
          <p className="mt-3 text-base text-muted-foreground">{d.register.lead}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
          <Stepper current={stepIndex} />
          <p className="tabular text-sm text-muted-foreground">
            {fill(d.register.stepLabel, {
              CURRENT: stepIndex + 1,
              TOTAL: STEPS.length,
            })}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            {/* ------------------------------------------------ step 1 */}
            {stepIndex === 0 && (
              <div>
                <h2 className="text-xl">{d.register.cohort.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d.register.cohort.lead}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {cohorts.map((item) => (
                    <CohortCard
                      key={item.id}
                      cohort={item}
                      selected={item.id === cohortId}
                      onSelect={(picked) => {
                        setCohortId(picked.id);
                        setErrors((prev) => ({ ...prev, cohort: undefined }));
                      }}
                    />
                  ))}
                </div>
                {errors.cohort && <p className="field-error">{errors.cohort}</p>}
              </div>
            )}

            {/* ------------------------------------------------ step 2 */}
            {stepIndex === 1 && (
              <div>
                <h2 className="text-xl">{d.register.details.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d.register.details.lead}</p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="reg-name">
                      {d.register.details.name}
                      <span className="text-xs font-normal text-muted-foreground">
                        {d.common.required}
                      </span>
                    </label>
                    <input
                      id="reg-name"
                      className="field-input"
                      value={fullName}
                      autoComplete="name"
                      placeholder={d.register.details.namePlaceholder}
                      aria-invalid={Boolean(errors.name)}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="field-label" htmlFor="reg-phone">
                      {d.register.details.phone}
                      <span className="text-xs font-normal text-muted-foreground">
                        {d.common.required}
                      </span>
                    </label>
                    <input
                      id="reg-phone"
                      className="field-input mono-ltr"
                      value={phone}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={d.register.details.phonePlaceholder}
                      aria-invalid={Boolean(errors.phone)}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                    {errors.phone ? (
                      <p className="field-error">{errors.phone}</p>
                    ) : (
                      <p className="field-hint">{d.register.details.phoneHint}</p>
                    )}
                  </div>

                  <div>
                    <label className="field-label" htmlFor="reg-email">
                      {d.register.details.email}
                      <span className="text-xs font-normal text-muted-foreground">
                        {d.common.required}
                      </span>
                    </label>
                    <input
                      id="reg-email"
                      className="field-input mono-ltr"
                      value={email}
                      type="email"
                      autoComplete="email"
                      placeholder={d.register.details.emailPlaceholder}
                      aria-invalid={Boolean(errors.email)}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    {errors.email && <p className="field-error">{errors.email}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="reg-company">
                      {d.register.details.company}
                      <span className="text-xs font-normal text-muted-foreground">
                        {d.common.optional}
                      </span>
                    </label>
                    <input
                      id="reg-company"
                      className="field-input"
                      value={company}
                      placeholder={d.register.details.companyPlaceholder}
                      onChange={(event) => setCompany(event.target.value)}
                    />
                  </div>
                </div>

                <label className="mt-6 flex items-start gap-3 text-sm text-foreground/85">
                  <input
                    type="checkbox"
                    checked={consent}
                    aria-invalid={Boolean(errors.consent)}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-input accent-[var(--primary)]"
                  />
                  <span>
                    {d.register.details.consent}{" "}
                    <Link
                      to={pagePath(lang, "terms")}
                      className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {d.nav.terms}
                    </Link>
                  </span>
                </label>
                {errors.consent && <p className="field-error">{errors.consent}</p>}
              </div>
            )}

            {/* ------------------------------------------------ step 3 */}
            {stepIndex === 2 && (
              <div>
                <h2 className="text-xl">{d.register.payment.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d.register.payment.lead}</p>

                <div className="card-raised mt-6 overflow-hidden">
                  <div className="flex items-center justify-between gap-4 bg-primary px-5 py-4 text-primary-foreground">
                    <div>
                      <p className="text-xs text-primary-foreground/70">
                        {d.register.payment.amount}
                      </p>
                      <p className="tabular mt-1 font-display text-2xl font-semibold">
                        {formatPrice(priceSar)}{" "}
                        <span className="text-base">
                          <SarSuffix lang={lang} />
                        </span>
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-primary-foreground/50" aria-hidden="true" />
                  </div>

                  <dl className="divide-y divide-border">
                    {[
                      { label: d.register.payment.bank, value: bankName(lang), mono: false },
                      {
                        label: d.register.payment.accountName,
                        value: accountName(lang),
                        mono: false,
                      },
                      { label: d.register.payment.iban, value: payout.ibanPretty, mono: true },
                      { label: d.register.payment.swift, value: payout.swift, mono: true },
                      {
                        label: d.register.payment.reference,
                        value: fullName.trim() || d.register.payment.referenceValue,
                        mono: false,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                      >
                        <dt className="text-sm text-muted-foreground">{row.label}</dt>
                        <dd className="flex items-center gap-3">
                          <span
                            className={`text-sm font-semibold text-foreground ${row.mono ? "mono-ltr" : ""}`}
                          >
                            {row.mono ? <Ltr>{row.value}</Ltr> : row.value}
                          </span>
                          <CopyButton value={row.value} label={row.label} />
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="border-t border-border p-4">
                    <CopyButton value={transferBlock} label={d.register.payment.copyAll} />
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-warning-soft p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                    <Info className="h-4 w-4" aria-hidden="true" />
                    {d.register.payment.noticeTitle}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground/75">
                    {d.register.payment.notice.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span aria-hidden="true">·</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ---------------------------------------- upload */}
                <div className="mt-8">
                  <h3 className="text-lg">{d.register.payment.upload.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {d.register.payment.upload.lead}
                  </p>

                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void attachFile(file);
                      event.target.value = "";
                    }}
                  />

                  {proof ? (
                    <div className="card-soft mt-4 flex flex-wrap items-center gap-4 p-4">
                      {proof.type === "application/pdf" ? (
                        <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                        </span>
                      ) : (
                        <img
                          src={proof.dataUrl}
                          alt={d.register.review.proof}
                          className="h-16 w-16 rounded-lg border border-border object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                          {d.register.payment.upload.uploaded}
                        </p>
                        <p className="mono-ltr mt-1 truncate text-xs text-muted-foreground">
                          {proof.name} · {formatBytes(proof.size)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={proof.dataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline min-h-9 px-3 text-xs"
                        >
                          {d.register.payment.upload.view}
                        </a>
                        <button
                          type="button"
                          onClick={() => fileInput.current?.click()}
                          className="btn btn-outline min-h-9 px-3 text-xs"
                        >
                          {d.register.payment.upload.replace}
                        </button>
                        <button
                          type="button"
                          onClick={() => setProof(null)}
                          aria-label={d.register.payment.upload.remove}
                          className="btn btn-outline min-h-9 w-9 px-0"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        const file = event.dataTransfer.files?.[0];
                        if (file) void attachFile(file);
                      }}
                      className={`mt-4 flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                        dragging ? "border-gold bg-accent/40" : "border-input bg-muted/40"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2
                            className="h-6 w-6 animate-spin text-primary"
                            aria-hidden="true"
                          />
                          <p className="mt-3 text-sm text-muted-foreground">
                            {d.register.payment.upload.uploading}
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                          <p className="mt-3 text-sm text-foreground/80">
                            {d.register.payment.upload.drop}{" "}
                            <button
                              type="button"
                              onClick={() => fileInput.current?.click()}
                              className="font-semibold text-primary underline underline-offset-4"
                            >
                              {d.register.payment.upload.browse}
                            </button>
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {d.register.payment.upload.accepted}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {errors.proof && <p className="field-error">{errors.proof}</p>}

                  <div className="mt-4 rounded-xl border border-dashed border-input bg-background p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Paperclip className="h-4 w-4 text-gold" aria-hidden="true" />
                      {d.register.payment.upload.demoTitle}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {d.register.payment.upload.demo}
                    </p>
                    <button type="button" onClick={attachSample} className="btn btn-outline mt-3">
                      {d.register.payment.upload.useSample}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------ step 4 */}
            {stepIndex === 3 && (
              <div>
                <h2 className="text-xl">{d.register.review.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d.register.review.lead}</p>

                <div className="card-soft mt-6 divide-y divide-border">
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {d.register.steps.cohort}
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">
                        {cohort ? cohort.monthLabel[lang] : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cohort ? cohort.startLabel[lang] : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStepIndex(0)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      {d.register.review.edit}
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {d.register.review.participant}
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">{fullName}</p>
                      <p className="mono-ltr text-sm text-muted-foreground">{phone}</p>
                      <p className="mono-ltr text-sm text-muted-foreground">{email}</p>
                      {company && <p className="text-sm text-muted-foreground">{company}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStepIndex(1)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      {d.register.review.edit}
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex items-center gap-4">
                      {proof && proof.type !== "application/pdf" ? (
                        <img
                          src={proof.dataUrl}
                          alt={d.register.review.proof}
                          className="h-14 w-14 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        </span>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          {d.register.review.proof}
                        </p>
                        <p className="mono-ltr mt-1.5 text-sm font-semibold text-foreground">
                          {proof?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {proof ? formatBytes(proof.size) : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStepIndex(2)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      {d.register.review.edit}
                    </button>
                  </div>
                </div>

                <p className="mt-5 flex items-start gap-2 rounded-xl bg-accent/70 p-4 text-sm leading-relaxed text-accent-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {d.register.review.notice}
                </p>
              </div>
            )}

            {/* ------------------------------------------------ nav */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              {stepIndex > 0 ? (
                <button type="button" onClick={goBack} className="btn btn-outline">
                  <Backward className="h-4 w-4" aria-hidden="true" />
                  {d.common.back}
                </button>
              ) : (
                <Link to={pagePath(lang, "home")} className="btn btn-outline">
                  <Backward className="h-4 w-4" aria-hidden="true" />
                  {d.common.backHome}
                </Link>
              )}

              {stepIndex < STEPS.length - 1 ? (
                <TactileButton type="button" onClick={goNext} tone="ink">
                  {d.common.next}
                  <Forward className="h-4 w-4" aria-hidden="true" />
                </TactileButton>
              ) : (
                <TactileButton
                  type="button"
                  onClick={() => void submit()}
                  disabled={submitting}
                  tone="gold"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  {submitting ? d.register.review.submitting : d.register.review.submit}
                </TactileButton>
              )}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
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

          <SummaryCard cohort={cohort} priceSar={priceSar} />
        </div>
      </div>
    </section>
  );
}
