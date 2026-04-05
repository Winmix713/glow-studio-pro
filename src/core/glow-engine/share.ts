// ─── Share URL Encoding/Decoding ───

import type { GlowDocument } from "./state";

export function encodeDocumentToUrl(doc: GlowDocument): string {
  try {
    const json = JSON.stringify(doc);
    const encoded = btoa(encodeURIComponent(json));
    return `${window.location.origin}${window.location.pathname}?mode=${doc.mode}#s=${encoded}`;
  } catch {
    return "";
  }
}

export function decodeDocumentFromUrl(): GlowDocument | null {
  try {
    const hash = window.location.hash;
    if (!hash.startsWith("#s=")) return null;
    const encoded = hash.slice(3);
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as GlowDocument;
  } catch {
    return null;
  }
}

export function clearShareHash(): void {
  if (window.location.hash.startsWith("#s=")) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}
