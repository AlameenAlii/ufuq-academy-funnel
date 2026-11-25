// Course data model. One course, several monthly cohorts.
//
// Seed values live here; the admin screen writes overrides into the demo store
// (see `src/lib/registration.ts`) so the landing page, the registration flow
// and the dashboard always read the same numbers.

import type { Lang } from "./i18n";

export type Bilingual = { en: string; ar: string };

export type CohortStatus = "open" | "few" | "full";

export type Cohort = {
  id: string;
  /** ISO start date, used for sorting and for the calendar file. */
  startDate: string;
  endDate: string;
  monthLabel: Bilingual;
  startLabel: Bilingual;
  scheduleLabel: Bilingual;
  seatsTotal: number;
  seatsTaken: number;
  status: CohortStatus;
};

export const COHORTS: Cohort[] = [
  {
    id: "oct-2026",
    startDate: "2026-10-05",
    endDate: "2026-11-12",
    monthLabel: { en: "October 2026", ar: "أكتوبر 2026" },
    startLabel: {
      en: "Starts Monday, 5 October",
      ar: "يبدأ الاثنين 5 أكتوبر",
    },
    scheduleLabel: {
      en: "Mon & Wed · 8:00-9:30pm",
      ar: "الاثنين والأربعاء · 8:00-9:30 م",
    },
    seatsTotal: 40,
    seatsTaken: 40,
    status: "full",
  },
  {
    id: "nov-2026",
    startDate: "2026-11-02",
    endDate: "2026-12-10",
    monthLabel: { en: "November 2026", ar: "نوفمبر 2026" },
    startLabel: {
      en: "Starts Monday, 2 November",
      ar: "يبدأ الاثنين 2 نوفمبر",
    },
    scheduleLabel: {
      en: "Mon & Wed · 8:00-9:30pm",
      ar: "الاثنين والأربعاء · 8:00-9:30 م",
    },
    seatsTotal: 40,
    seatsTaken: 33,
    status: "few",
  },
  {
    id: "dec-2026",
    startDate: "2026-12-07",
    endDate: "2027-01-14",
    monthLabel: { en: "December 2026", ar: "ديسمبر 2026" },
    startLabel: {
      en: "Starts Monday, 7 December",
      ar: "يبدأ الاثنين 7 ديسمبر",
    },
    scheduleLabel: {
      en: "Sun & Tue · 8:00-9:30pm",
      ar: "الأحد والثلاثاء · 8:00-9:30 م",
    },
    seatsTotal: 40,
    seatsTaken: 12,
    status: "open",
  },
  {
    id: "jan-2027",
    startDate: "2027-01-11",
    endDate: "2027-02-18",
    monthLabel: { en: "January 2027", ar: "يناير 2027" },
    startLabel: {
      en: "Starts Monday, 11 January",
      ar: "يبدأ الاثنين 11 يناير",
    },
    scheduleLabel: {
      en: "Sun & Tue · 8:00-9:30pm",
      ar: "الأحد والثلاثاء · 8:00-9:30 م",
    },
    seatsTotal: 40,
    seatsTaken: 4,
    status: "open",
  },
];

export const course = {
  priceSar: 1450,
  fullPriceSar: 1850,
  /** Early-bird deadline, shown in the pricing card. */
  offerEndsOn: "2026-09-30",
  weeks: 6,
  sessions: 12,
  liveHours: 24,
  recordingsMonths: 6,
  seatsPerCohort: 40,
  attendanceEn: "Live online (Zoom) + recordings",
  attendanceAr: "أونلاين مباشر (Zoom) + تسجيلات",
  languageEn: "Arabic, with English terminology",
  languageAr: "العربية، مع المصطلحات الإنجليزية",
} as const;

export const instructor = {
  nameEn: "Faisal Al-Dossari",
  nameAr: "فيصل الدوسري",
  roleEn: "Head of Growth · 12 years in digital marketing",
  roleAr: "مدير النمو · 12 سنة في التسويق الرقمي",
  bioEn:
    "Faisal has led paid acquisition and content teams for Saudi e-commerce and SaaS brands, managing more than 40 million SAR in ad spend. The course is built on the same playbooks used with those teams, not on theory.",
  bioAr:
    "قاد فيصل فرق الإعلانات المدفوعة والمحتوى لعلامات سعودية في التجارة الإلكترونية والبرمجيات، وأدار أكثر من 40 مليون ريال من الميزانيات الإعلانية. الدورة مبنية على نفس أساليب العمل التي طُبّقت مع هذه الفرق، وليست نظرية.",
  credentialsEn: [
    "Managed 40M+ SAR in ad spend",
    "Meta & Google certified",
    "Trained 1,200+ marketers",
  ],
  credentialsAr: [
    "أدار أكثر من 40 مليون ريال إعلانات",
    "معتمد من Meta و Google",
    "درّب أكثر من 1200 مسوّق",
  ],
} as const;

export function instructorName(lang: Lang): string {
  return lang === "ar" ? instructor.nameAr : instructor.nameEn;
}

export function instructorRole(lang: Lang): string {
  return lang === "ar" ? instructor.roleAr : instructor.roleEn;
}

export function instructorBio(lang: Lang): string {
  return lang === "ar" ? instructor.bioAr : instructor.bioEn;
}

export function instructorCredentials(lang: Lang): readonly string[] {
  return lang === "ar" ? instructor.credentialsAr : instructor.credentialsEn;
}

export function attendanceLabel(lang: Lang): string {
  return lang === "ar" ? course.attendanceAr : course.attendanceEn;
}

export function courseLanguageLabel(lang: Lang): string {
  return lang === "ar" ? course.languageAr : course.languageEn;
}

export function cohortLabel(cohort: Cohort, lang: Lang): string {
  return cohort.monthLabel[lang];
}

export function seatsLeft(cohort: Cohort): number {
  return Math.max(0, cohort.seatsTotal - cohort.seatsTaken);
}

export function isBookable(cohort: Cohort): boolean {
  return cohort.status !== "full" && seatsLeft(cohort) > 0;
}

export function firstBookableCohort(cohorts: Cohort[] = COHORTS): Cohort | undefined {
  return cohorts.find(isBookable);
}

export function cohortById(id: string, cohorts: Cohort[] = COHORTS): Cohort | undefined {
  return cohorts.find((cohort) => cohort.id === id);
}

/** Thousands separator with Latin digits in both locales. */
export function formatPrice(value: number): string {
  return value.toLocaleString("en-US");
}
