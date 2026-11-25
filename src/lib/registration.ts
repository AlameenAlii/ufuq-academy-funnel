// Demo persistence layer for registrations and operator overrides.
//
// The whole funnel runs client-side: submissions, uploaded proofs and admin
// edits are stored in localStorage under a single key. Swapping this file for
// real API calls is the only change needed to go live (see HANDOFF.md).

import { COHORTS, course, type Cohort, type CohortStatus } from "./course";
import { images } from "./images";

export type PaymentStatus = "pending_review" | "verified" | "rejected";

export type ProofFile = {
  name: string;
  size: number;
  type: string;
  /** Data URL for uploads, or a public path for the seeded sample. */
  dataUrl: string;
};

export type Registration = {
  reference: string;
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  cohortId: string;
  amountSar: number;
  status: PaymentStatus;
  submittedAt: string;
  proof: ProofFile | null;
  note?: string;
};

export type CohortOverride = {
  seatsTaken?: number;
  status?: CohortStatus;
};

export type CourseOverrides = {
  priceSar?: number;
  cohorts?: Record<string, CohortOverride>;
};

export type DemoStore = {
  version: 1;
  registrations: Registration[];
  overrides: CourseOverrides;
};

export const STORE_KEY = "ufuq-demo-store-v1";
export const STORE_EVENT = "ufuq-store";

export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_PROOF_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;

const sampleProof = (name: string): ProofFile => ({
  name,
  size: 268_400,
  type: "image/png",
  dataUrl: images.demoReceipt,
});

/** Seeded rows so the dashboard is never empty during a client walkthrough. */
const SEED_REGISTRATIONS: Registration[] = [
  {
    reference: "UFUQ-2026-0418",
    fullName: "\u0633\u0627\u0631\u0629 \u0627\u0644\u0642\u062d\u0637\u0627\u0646\u064a",
    phone: "+966 55 842 1190",
    email: "sara.q@example.com",
    company: "Mezan Store",
    cohortId: "nov-2026",
    amountSar: 1450,
    status: "verified",
    submittedAt: "2026-09-12T09:24:00.000Z",
    proof: sampleProof("transfer-receipt.png"),
  },
  {
    reference: "UFUQ-2026-0421",
    fullName: "\u0639\u0628\u062f\u0627\u0644\u0631\u062d\u0645\u0646 \u0627\u0644\u0634\u0647\u0631\u064a",
    phone: "+966 50 224 7783",
    email: "a.alshehri@example.com",
    cohortId: "nov-2026",
    amountSar: 1450,
    status: "verified",
    submittedAt: "2026-09-13T17:02:00.000Z",
    proof: sampleProof("rajhi-transfer.png"),
  },
  {
    reference: "UFUQ-2026-0426",
    fullName: "\u0646\u0648\u0631\u0629 \u0627\u0644\u0639\u062a\u064a\u0628\u064a",
    phone: "+966 53 118 9042",
    email: "noura.o@example.com",
    company: "Freelance",
    cohortId: "dec-2026",
    amountSar: 1450,
    status: "pending_review",
    submittedAt: "2026-09-17T11:48:00.000Z",
    proof: sampleProof("receipt-2026-09-17.png"),
  },
  {
    reference: "UFUQ-2026-0429",
    fullName: "Yousef Bin Salem",
    phone: "+966 56 903 3321",
    email: "yousef.s@example.com",
    cohortId: "dec-2026",
    amountSar: 1450,
    status: "pending_review",
    submittedAt: "2026-09-18T06:15:00.000Z",
    proof: sampleProof("bank-transfer.png"),
  },
  {
    reference: "UFUQ-2026-0433",
    fullName: "\u0645\u0627\u062c\u062f \u0627\u0644\u062d\u0631\u0628\u064a",
    phone: "+966 59 447 2018",
    email: "majed.h@example.com",
    cohortId: "dec-2026",
    amountSar: 1450,
    status: "rejected",
    submittedAt: "2026-09-18T19:40:00.000Z",
    proof: sampleProof("screenshot.png"),
    note: "Amount does not match the course fee.",
  },
];

export function emptyStore(): DemoStore {
  return {
    version: 1,
    registrations: SEED_REGISTRATIONS.map((row) => ({ ...row })),
    overrides: {},
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readStore(): DemoStore {
  if (!isBrowser()) return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<DemoStore>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.registrations)) {
      return emptyStore();
    }
    return {
      version: 1,
      registrations: parsed.registrations,
      overrides: parsed.overrides ?? {},
    };
  } catch {
    return emptyStore();
  }
}

export function writeStore(store: DemoStore): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Quota or private mode: the in-memory state still drives the session.
  }
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function resetStore(): DemoStore {
  const fresh = emptyStore();
  writeStore(fresh);
  return fresh;
}

/** Applies admin overrides on top of the seed cohorts. */
export function resolveCohorts(store: DemoStore): Cohort[] {
  const overrides = store.overrides.cohorts ?? {};
  return COHORTS.map((cohort) => {
    const override = overrides[cohort.id];
    if (!override) return cohort;
    const seatsTaken = Math.min(
      cohort.seatsTotal,
      Math.max(0, override.seatsTaken ?? cohort.seatsTaken),
    );
    return {
      ...cohort,
      seatsTaken,
      status: override.status ?? cohort.status,
    };
  });
}

export function resolvePrice(store: DemoStore): number {
  return store.overrides.priceSar ?? course.priceSar;
}

/** Sequential-looking reference, unique within the demo store. */
export function nextReference(store: DemoStore): string {
  const year = new Date().getFullYear();
  const used = store.registrations
    .map((row) => Number.parseInt(row.reference.split("-").pop() ?? "0", 10))
    .filter((value) => Number.isFinite(value));
  const next = (used.length ? Math.max(...used) : 400) + Math.ceil(Math.random() * 4);
  return `UFUQ-${year}-${String(next).padStart(4, "0")}`;
}

export function addRegistration(
  input: Omit<Registration, "reference" | "status" | "submittedAt">,
): Registration {
  const store = readStore();
  const registration: Registration = {
    ...input,
    reference: nextReference(store),
    status: "pending_review",
    submittedAt: new Date().toISOString(),
  };
  const cohorts = store.overrides.cohorts ?? {};
  const current = cohorts[input.cohortId];
  const seed = COHORTS.find((cohort) => cohort.id === input.cohortId);
  const seatsTaken = Math.min(
    seed?.seatsTotal ?? course.seatsPerCohort,
    (current?.seatsTaken ?? seed?.seatsTaken ?? 0) + 1,
  );
  writeStore({
    ...store,
    registrations: [registration, ...store.registrations],
    overrides: {
      ...store.overrides,
      cohorts: { ...cohorts, [input.cohortId]: { ...current, seatsTaken } },
    },
  });
  return registration;
}

export function setPaymentStatus(reference: string, status: PaymentStatus): void {
  const store = readStore();
  writeStore({
    ...store,
    registrations: store.registrations.map((row) =>
      row.reference === reference ? { ...row, status } : row,
    ),
  });
}

export function saveOverrides(overrides: CourseOverrides): void {
  const store = readStore();
  writeStore({ ...store, overrides: { ...store.overrides, ...overrides } });
}

export type ProofError = "type" | "size";

export function validateProof(file: File): ProofError | null {
  if (!(ACCEPTED_PROOF_TYPES as readonly string[]).includes(file.type)) return "type";
  if (file.size > MAX_PROOF_BYTES) return "size";
  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function toCsv(rows: Registration[], headers: string[]): string {
  const escape = (value: string | number) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.reference,
        row.fullName,
        row.phone,
        row.email,
        row.company ?? "",
        row.cohortId,
        row.amountSar,
        row.status,
        row.submittedAt,
        row.proof?.name ?? "",
      ]
        .map(escape)
        .join(","),
    );
  }
  return lines.join("\n");
}

/** Triggers a real file download; the BOM keeps Arabic readable in Excel. */
export function downloadCsv(filename: string, csv: string): void {
  if (!isBrowser()) return;
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<boolean> {
  if (!isBrowser()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Minimal .ics so participants can save the cohort start date. */
export function downloadIcs(args: {
  filename: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}): void {
  if (!isBrowser()) return;
  const stamp = (value: string) => value.replace(/-/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ufuq Academy//Course//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@example.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${stamp(args.startDate)}`,
    `DTEND;VALUE=DATE:${stamp(args.endDate)}`,
    `SUMMARY:${args.title}`,
    `DESCRIPTION:${args.description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = args.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
