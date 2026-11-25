import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

/**
 * New Saudi Riyal symbol (SAMA) from the self-hosted `SaudiRiyalSymbol` face.
 * Glyph lives at U+00EA — always keep it isolated in `.riyal-symbol` so it
 * never leaks into normal text (U+00EA is `ê` elsewhere).
 *
 * Per SAMA: symbol sits left of the numeral with a space, inherits size/color.
 * Screen readers get "ر.س" / "SAR" via visually-hidden fallback text.
 */
export function SaudiRiyal({ className }: { className?: string }) {
  return (
    <span className={cn("riyal-symbol", className)} aria-hidden="true">
      &#xea;
    </span>
  );
}

/**
 * Currency suffix for prices. Arabic gets the new symbol, English keeps "SAR".
 * Use this everywhere a price is rendered visually. Plain-text contexts
 * (WhatsApp, clipboard, CSV) must keep using `d.common.sar` ("ر.س" / "SAR").
 */
export function SarSuffix({ lang, className }: { lang: Lang; className?: string }) {
  if (lang === "ar") {
    return (
      <>
        <SaudiRiyal className={className} />
        <span className="sr-only">ر.س</span>
      </>
    );
  }
  return <span className={className}>SAR</span>;
}
