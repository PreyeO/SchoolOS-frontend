// Strips tags for a one-line preview. body_html is already bleach-sanitized
// server-side to a fixed allowlist, so this is about flattening structure for a
// single line, not about safety — and the result goes into a text node, never
// back into dangerouslySetInnerHTML.
export function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
