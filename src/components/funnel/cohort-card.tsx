// One monthly cohort, shared by the landing page and the registration flow.
// A full cohort is never selectable: it shows a waitlist link instead.

import { Check, Lock } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

import { cohortLabel, isBookable, seatsLeft, type Cohort } from "@/lib/course";
import { fill, useDict, useLang } from "@/lib/i18n";
import { waitlistUrl } from "@/lib/whatsapp";

export function CohortStatusPill({ cohort }: { cohort: Cohort }) {
  const d = useDict();
  if (cohort.status === "full") {
    return (
      <span className="pill-danger">
        <Lock className="h-3 w-3" aria-hidden="true" />
        {d.home.cohorts.statusFull}
      </span>
    );
  }
  if (cohort.status === "few") {
    return <span className="pill-warning">{d.home.cohorts.statusFew}</span>;
  }
  return <span className="pill-success">{d.home.cohorts.statusOpen}</span>;
}

function SeatsBar({ cohort }: { cohort: Cohort }) {
  const percent = Math.min(100, Math.round((cohort.seatsTaken / cohort.seatsTotal) * 100));
  const tone =
    cohort.status === "full"
      ? "bg-destructive"
      : cohort.status === "few"
        ? "bg-warning"
        : "bg-success";

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={cohort.seatsTotal}
      aria-valuenow={cohort.seatsTaken}
    >
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export function CohortCard({
  cohort,
  selected = false,
  onSelect,
  showAction = true,
}: {
  cohort: Cohort;
  selected?: boolean;
  onSelect?: (cohort: Cohort) => void;
  showAction?: boolean;
}) {
  const lang = useLang();
  const d = useDict();
  const bookable = isBookable(cohort);
  const left = seatsLeft(cohort);

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-primary-deep">
            {cohortLabel(cohort, lang)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{cohort.startLabel[lang]}</p>
        </div>
        <CohortStatusPill cohort={cohort} />
      </div>

      <p className="mt-4 text-sm text-foreground/75">{cohort.scheduleLabel[lang]}</p>

      <div className="mt-5 space-y-2">
        <SeatsBar cohort={cohort} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular">
            {fill(d.home.cohorts.seatsTaken, {
              TAKEN: cohort.seatsTaken,
              TOTAL: cohort.seatsTotal,
            })}
          </span>
          {bookable ? (
            <span className="tabular font-semibold text-success">
              {fill(d.common.seatsLeft, { COUNT: left })}
            </span>
          ) : (
            <span className="font-semibold text-destructive">{d.common.soldOut}</span>
          )}
        </div>
      </div>
    </>
  );

  // Full cohorts stay on the page as proof of demand, with a waitlist route out.
  if (!bookable) {
    return (
      <div className="card-soft flex flex-col p-5">
        {body}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {d.home.cohorts.fullNote}
        </p>
        {showAction && (
          <a
            href={waitlistUrl(cohort.id, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline mt-4 w-full"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {d.common.joinWaitlist}
          </a>
        )}
      </div>
    );
  }

  if (!onSelect) {
    return <div className="card-soft flex flex-col p-5">{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(cohort)}
      aria-pressed={selected}
      className={`card-soft flex flex-col p-5 text-start transition ${
        selected
          ? "border-gold ring-2 ring-gold/25"
          : "hover:border-gold/60 hover:shadow-[0_4px_14px_rgb(0_0_0/0.05)]"
      }`}
    >
      {body}
      {showAction && (
        <span
          className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${
            selected ? "text-gold-foreground" : "text-muted-foreground"
          }`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
              selected ? "border-gold bg-gold text-white" : "border-input"
            }`}
            aria-hidden="true"
          >
            {selected && <Check className="h-3 w-3" />}
          </span>
          {d.home.cohorts.select}
        </span>
      )}
    </button>
  );
}
