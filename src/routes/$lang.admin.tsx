// Operator dashboard (demo): review receipts, set payment status, export the
// list, and edit course settings. Everything reads/writes the local demo store.

import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Check,
  Clock3,
  Download,
  FileText,
  RotateCcw,
  Search,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useEffect, useMemo, useState } from "react";

import { useDemoStore } from "@/components/funnel/use-demo-store";
import { SarSuffix } from "@/components/saudi-riyal";
import { Ltr } from "@/components/site-chrome";
import { COHORTS, cohortById, formatPrice, type CohortStatus } from "@/lib/course";
import { dict, fill, pagePath, useDict, useLang, type Lang } from "@/lib/i18n";
import {
  downloadCsv,
  resetStore,
  saveOverrides,
  setPaymentStatus,
  toCsv,
  type PaymentStatus,
  type Registration,
} from "@/lib/registration";
import { seoLinks, seoMeta } from "@/lib/seo";
import { participantUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/$lang/admin")({
  head: ({ params }) => {
    const lang = (params.lang === "en" ? "en" : "ar") as Lang;
    const d = dict(lang);
    return {
      meta: seoMeta({
        lang,
        title: d.admin.meta.title,
        description: d.admin.meta.description,
        path: pagePath(lang, "admin"),
        // Internal tool: kept out of search results.
        noIndex: true,
      }),
      links: seoLinks("admin", lang),
    };
  },
  component: AdminPage,
});

const STATUSES: PaymentStatus[] = ["pending_review", "verified", "rejected"];
const COHORT_STATUSES: CohortStatus[] = ["open", "few", "full"];

function StatusPill({ status }: { status: PaymentStatus }) {
  const d = useDict();
  const className =
    status === "verified"
      ? "pill-success"
      : status === "rejected"
        ? "pill-danger"
        : "pill-warning";
  return <span className={className}>{d.admin.status[status]}</span>;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="card-soft flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="tabular mt-1 font-display text-xl font-semibold text-primary-deep">
          {value}
        </p>
      </div>
    </div>
  );
}

function AdminPage() {
  const lang = useLang();
  const d = useDict();
  const { store, cohorts, priceSar, refresh } = useDemoStore();

  const [search, setSearch] = useState("");
  const [cohortFilter, setCohortFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [preview, setPreview] = useState<Registration | null>(null);
  const [priceDraft, setPriceDraft] = useState(String(priceSar));
  const [seatDrafts, setSeatDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, CohortStatus>>({});
  const [saved, setSaved] = useState(false);

  // Keep the settings form in sync with the store (including after a reset).
  useEffect(() => {
    setPriceDraft(String(priceSar));
    setSeatDrafts(
      Object.fromEntries(cohorts.map((cohort) => [cohort.id, String(cohort.seatsTaken)])),
    );
    setStatusDrafts(Object.fromEntries(cohorts.map((cohort) => [cohort.id, cohort.status])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceSar, store.overrides]);

  const rows = store.registrations;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (cohortFilter !== "all" && row.cohortId !== cohortFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!term) return true;
      return [row.fullName, row.email, row.phone, row.reference]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rows, search, cohortFilter, statusFilter]);

  const stats = useMemo(() => {
    const pending = rows.filter((row) => row.status === "pending_review").length;
    const verified = rows.filter((row) => row.status === "verified");
    return {
      total: rows.length,
      pending,
      verified: verified.length,
      revenue: verified.reduce((sum, row) => sum + row.amountSar, 0),
    };
  }, [rows]);

  const dateFormatter = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  function updateStatus(reference: string, status: PaymentStatus) {
    setPaymentStatus(reference, status);
    refresh();
  }

  function exportCsv() {
    const csv = toCsv(filtered, [
      d.admin.table.reference,
      d.admin.table.participant,
      d.register.details.phone,
      d.register.details.email,
      d.register.details.company,
      d.admin.table.cohort,
      d.admin.table.amount,
      d.admin.table.status,
      d.admin.table.submitted,
      d.admin.table.proof,
    ]);
    downloadCsv(`ufuq-registrations-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  function saveSettings() {
    const price = Number.parseInt(priceDraft, 10);
    saveOverrides({
      priceSar: Number.isFinite(price) && price > 0 ? price : undefined,
      cohorts: Object.fromEntries(
        COHORTS.map((cohort) => {
          const seats = Number.parseInt(seatDrafts[cohort.id] ?? "", 10);
          return [
            cohort.id,
            {
              seatsTaken: Number.isFinite(seats) ? seats : cohort.seatsTaken,
              status: statusDrafts[cohort.id] ?? cohort.status,
            },
          ];
        }),
      ),
    });
    refresh();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="section-tight">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="pill-neutral">{d.admin.badge}</span>
            <h1 className="mt-3 text-2xl sm:text-3xl">{d.admin.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{d.admin.lead}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={exportCsv} className="btn btn-outline">
              <Download className="h-4 w-4" aria-hidden="true" />
              {d.admin.filters.export}
            </button>
            <button
              type="button"
              onClick={() => {
                resetStore();
                refresh();
              }}
              className="btn btn-outline"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {d.admin.filters.reset}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
            label={d.admin.stats.total}
            value={String(stats.total)}
          />
          <StatCard
            icon={<Clock3 className="h-5 w-5" aria-hidden="true" />}
            label={d.admin.stats.pending}
            value={String(stats.pending)}
          />
          <StatCard
            icon={<BadgeCheck className="h-5 w-5" aria-hidden="true" />}
            label={d.admin.stats.verified}
            value={String(stats.verified)}
          />
          <StatCard
            icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
            label={d.admin.stats.revenue}
            value={
              <>
                {formatPrice(stats.revenue)} <SarSuffix lang={lang} />
              </>
            }
          />
        </div>

        {/* ---------------------------------------------------- filters */}
        <div className="card-soft mt-8 flex flex-wrap items-end gap-4 p-5">
          <div className="min-w-[15rem] flex-1">
            <label className="field-label" htmlFor="admin-search">
              {d.admin.filters.search}
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3"
                aria-hidden="true"
              />
              <input
                id="admin-search"
                className="field-input ltr:pl-9 rtl:pr-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={d.admin.filters.search}
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="admin-cohort">
              {d.admin.table.cohort}
            </label>
            <select
              id="admin-cohort"
              className="field-input"
              value={cohortFilter}
              onChange={(event) => setCohortFilter(event.target.value)}
            >
              <option value="all">{d.admin.filters.cohort}</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.monthLabel[lang]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="admin-status">
              {d.admin.table.status}
            </label>
            <select
              id="admin-status"
              className="field-input"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | PaymentStatus)
              }
            >
              <option value="all">{d.admin.filters.status}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {d.admin.status[status]}
                </option>
              ))}
            </select>
          </div>

          <p className="tabular pb-2 text-sm text-muted-foreground">
            {fill(d.admin.filters.resultCount, { COUNT: filtered.length })}
          </p>
        </div>

        {/* ------------------------------------------------------ table */}
        <div className="card-soft mt-6 overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-start">
                {[
                  d.admin.table.reference,
                  d.admin.table.participant,
                  d.admin.table.cohort,
                  d.admin.table.amount,
                  d.admin.table.status,
                  d.admin.table.submitted,
                  d.admin.table.actions,
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-start text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    {d.admin.table.empty}
                  </td>
                </tr>
              )}
              {filtered.map((row) => {
                const cohort = cohortById(row.cohortId, cohorts);
                return (
                  <tr key={row.reference} className="border-b border-border last:border-0">
                    <td className="mono-ltr whitespace-nowrap px-4 py-3 font-medium text-primary-deep">
                      {row.reference}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{row.fullName}</p>
                      <p className="mono-ltr text-xs text-muted-foreground">{row.email}</p>
                      <p className="mono-ltr text-xs text-muted-foreground">
                        <Ltr>{row.phone}</Ltr>
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground/80">
                      {cohort ? cohort.monthLabel[lang] : row.cohortId}
                    </td>
                    <td className="tabular whitespace-nowrap px-4 py-3 text-foreground/80">
                      {formatPrice(row.amountSar)} <SarSuffix lang={lang} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="tabular whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {dateFormatter.format(new Date(row.submittedAt))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreview(row)}
                          disabled={!row.proof}
                          className="btn btn-outline min-h-8 px-2.5 text-xs disabled:opacity-40"
                        >
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          {d.admin.table.view}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(row.reference, "verified")}
                          disabled={row.status === "verified"}
                          className="btn btn-outline min-h-8 px-2.5 text-xs disabled:opacity-40"
                        >
                          <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                          {d.admin.table.verify}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(row.reference, "rejected")}
                          disabled={row.status === "rejected"}
                          className="btn btn-outline min-h-8 px-2.5 text-xs disabled:opacity-40"
                        >
                          <X className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                          {d.admin.table.reject}
                        </button>
                        <a
                          href={participantUrl(row.phone, lang, row.reference)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline min-h-8 px-2.5 text-xs"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5" />
                          {d.admin.table.contact}
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --------------------------------------------------- settings */}
        <div className="card-soft mt-10 p-6">
          <h2 className="text-lg">{d.admin.settings.title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{d.admin.settings.lead}</p>

          <div className="mt-6 max-w-xs">
            <label className="field-label" htmlFor="admin-price">
              {d.admin.settings.price}
            </label>
            <input
              id="admin-price"
              className="field-input tabular"
              inputMode="numeric"
              value={priceDraft}
              onChange={(event) => setPriceDraft(event.target.value)}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {COHORTS.map((cohort) => (
              <div key={cohort.id} className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">{cohort.monthLabel[lang]}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor={`seats-${cohort.id}`}>
                      {d.admin.settings.cohortSeats}
                    </label>
                    <input
                      id={`seats-${cohort.id}`}
                      className="field-input tabular"
                      inputMode="numeric"
                      value={seatDrafts[cohort.id] ?? ""}
                      onChange={(event) =>
                        setSeatDrafts((prev) => ({ ...prev, [cohort.id]: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`status-${cohort.id}`}>
                      {d.admin.settings.cohortStatus}
                    </label>
                    <select
                      id={`status-${cohort.id}`}
                      className="field-input"
                      value={statusDrafts[cohort.id] ?? cohort.status}
                      onChange={(event) =>
                        setStatusDrafts((prev) => ({
                          ...prev,
                          [cohort.id]: event.target.value as CohortStatus,
                        }))
                      }
                    >
                      {COHORT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status === "open"
                            ? d.home.cohorts.statusOpen
                            : status === "few"
                              ? d.home.cohorts.statusFew
                              : d.home.cohorts.statusFull}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={saveSettings} className="btn btn-primary mt-6">
            {saved ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            )}
            {saved ? d.admin.settings.saved : d.admin.settings.save}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ proof viewer */}
      {preview?.proof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-basalt/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={d.admin.proof.title}
        >
          <button
            type="button"
            aria-label={d.common.close}
            className="absolute inset-0"
            onClick={() => setPreview(null)}
          />
          <div className="relative max-h-[88vh] w-full max-w-lg overflow-auto rounded-2xl bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-primary-deep">
                  {d.admin.proof.title}
                </h2>
                <p className="mono-ltr mt-1 text-xs text-muted-foreground">
                  {preview.reference} · {preview.proof.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label={d.common.close}
                className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-border transition hover:bg-muted"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {preview.proof.type === "application/pdf" ? (
              <div className="mt-4 flex flex-col items-center rounded-xl bg-muted p-10 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="mono-ltr mt-3 text-sm text-muted-foreground">
                  {preview.proof.name}
                </p>
              </div>
            ) : (
              <img
                src={preview.proof.dataUrl}
                alt={d.admin.proof.alt}
                className="mt-4 w-full rounded-xl border border-border"
              />
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={preview.proof.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                {d.admin.proof.openFull}
              </a>
              <button
                type="button"
                onClick={() => {
                  updateStatus(preview.reference, "verified");
                  setPreview(null);
                }}
                className="btn btn-primary"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                {d.admin.table.verify}
              </button>
              <button
                type="button"
                onClick={() => {
                  updateStatus(preview.reference, "rejected");
                  setPreview(null);
                }}
                className="btn btn-outline"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                {d.admin.table.reject}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
