// Static image paths. Files live in `public/`, so these are absolute URLs.

export const images = {
  hero: "/home/hero.jpg",
  instructor: "/home/instructor.jpg",
  /** Sample bank transfer receipt used by the demo upload flow. */
  demoReceipt: "/demo/transfer-receipt.png",
} as const;

export type ImageKey = keyof typeof images;
