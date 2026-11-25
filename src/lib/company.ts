// Single source of truth for brand, legal, contact and payout details.
// Swap these values for the client's real ones before launch.

import type { Lang } from "./i18n";

export const brand = {
  nameEn: "Ufuq Academy",
  nameAr: "أكاديمية أفق",
  lineEn: "Applied digital marketing training",
  lineAr: "تدريب تطبيقي في التسويق الرقمي",
  legalNameEn: "Ufuq Training Est.",
  legalNameAr: "مؤسسة أفق للتدريب",
  unifiedNationalNumber: "7012345678",
  commercialRegistration: "1010654321",
  vatNumber: "310123456700003",
  domain: "example.com",
} as const;

export const contact = {
  cityEn: "Riyadh",
  cityAr: "الرياض",
  countryEn: "Saudi Arabia",
  countryAr: "المملكة العربية السعودية",
  whatsappDisplay: "+966 55 123 4567",
  whatsappDigits: "966551234567",
  email: "join@example.com",
  responseHoursEn: "Sunday to Thursday, 9am - 6pm (KSA)",
  responseHoursAr: "الأحد إلى الخميس، 9 ص - 6 م بتوقيت المملكة",
} as const;

/**
 * Offline (bank transfer) payout details shown on the payment step.
 * This is the only payment rail in the product: no card gateway, no Apple Pay.
 */
export const payout = {
  bankNameEn: "Al Rajhi Bank",
  bankNameAr: "مصرف الراجحي",
  accountNameEn: "Ufuq Training Est.",
  accountNameAr: "مؤسسة أفق للتدريب",
  iban: "SA0380000000608010167519",
  ibanPretty: "SA03 8000 0000 6080 1016 7519",
  swift: "RJHISARI",
  currency: "SAR",
} as const;

export const telHref = `tel:+${contact.whatsappDigits}`;
export const mailHref = `mailto:${contact.email}`;

export type LegalLine = { label: string; value: string };

export type LegalLabels = {
  legalNameLabel: string;
  unifiedNumberLabel: string;
  crLabel: string;
  vatLabel: string;
};

export function legalLines(lang: Lang, labels: LegalLabels): LegalLine[] {
  return [
    {
      label: labels.legalNameLabel,
      value: lang === "ar" ? brand.legalNameAr : brand.legalNameEn,
    },
    { label: labels.crLabel, value: brand.commercialRegistration },
    { label: labels.vatLabel, value: brand.vatNumber },
    { label: labels.unifiedNumberLabel, value: brand.unifiedNationalNumber },
  ];
}

export function locationLine(lang: Lang): string {
  return lang === "ar"
    ? `${contact.cityAr}، ${contact.countryAr}`
    : `${contact.cityEn}, ${contact.countryEn}`;
}

export function brandName(lang: Lang): string {
  return lang === "ar" ? brand.nameAr : brand.nameEn;
}

export function brandLine(lang: Lang): string {
  return lang === "ar" ? brand.lineAr : brand.lineEn;
}

export function accountName(lang: Lang): string {
  return lang === "ar" ? payout.accountNameAr : payout.accountNameEn;
}

export function bankName(lang: Lang): string {
  return lang === "ar" ? payout.bankNameAr : payout.bankNameEn;
}

export function responseHours(lang: Lang): string {
  return lang === "ar" ? contact.responseHoursAr : contact.responseHoursEn;
}
