// WhatsApp deep links. Every message is pre-written in the reader's language
// so the operator receives a structured, actionable message.

import { contact } from "./company";
import { COHORTS, cohortById, formatPrice } from "./course";
import type { Lang } from "./i18n";

export const WA_HOST = "https://wa.me";

export function waUrl(message: string, phoneDigits = contact.whatsappDigits): string {
  return `${WA_HOST}/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

/** Generic "I have a question" link used in the header, footer and FAQ. */
export function generalRequestUrl(lang: Lang): string {
  const message =
    lang === "ar"
      ? "السلام عليكم، لدي استفسار عن دورة التسويق الرقمي التطبيقية."
      : "Hello, I have a question about the Applied Digital Marketing course.";
  return waUrl(message);
}

/** Waitlist link shown on a cohort that is already full. */
export function waitlistUrl(cohortId: string, lang: Lang): string {
  const cohort = cohortById(cohortId, COHORTS);
  const label = cohort ? cohort.monthLabel[lang] : cohortId;
  const message =
    lang === "ar"
      ? `السلام عليكم، دفعة ${label} مكتملة. أرغب في الانضمام لقائمة الانتظار.`
      : `Hello, the ${label} cohort is full. I would like to join the waitlist.`;
  return waUrl(message);
}

/** Sent by the participant after submitting, so the operator can match it. */
export function confirmationUrl(
  args: {
    reference: string;
    fullName: string;
    cohortId: string;
    amountSar: number;
  },
  lang: Lang,
): string {
  const cohort = cohortById(args.cohortId, COHORTS);
  const label = cohort ? cohort.monthLabel[lang] : args.cohortId;
  const message =
    lang === "ar"
      ? [
          "السلام عليكم، أرسلت طلب تسجيل في دورة التسويق الرقمي التطبيقية.",
          `الاسم: ${args.fullName}`,
          `الدفعة: ${label}`,
          `المبلغ المحول: ${formatPrice(args.amountSar)} ر.س`,
          `الرقم المرجعي: ${args.reference}`,
        ].join("\n")
      : [
          "Hello, I have submitted a registration for the Applied Digital Marketing course.",
          `Name: ${args.fullName}`,
          `Cohort: ${label}`,
          `Amount transferred: ${formatPrice(args.amountSar)} SAR`,
          `Reference: ${args.reference}`,
        ].join("\n");
  return waUrl(message);
}

/** Operator -> participant link, used from the admin table. */
export function participantUrl(
  phone: string,
  lang: Lang,
  reference: string,
): string {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  const normalized = digits.startsWith("966") ? digits : `966${digits}`;
  const message =
    lang === "ar"
      ? `مرحباً، بخصوص تسجيلك رقم ${reference} في دورة التسويق الرقمي التطبيقية.`
      : `Hello, regarding your registration ${reference} for the Applied Digital Marketing course.`;
  return waUrl(message, normalized);
}
