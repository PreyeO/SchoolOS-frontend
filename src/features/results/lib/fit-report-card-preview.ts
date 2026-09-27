// Makes the server-rendered report card fit a phone-width iframe.
//
// The preview HTML is the same template WeasyPrint turns into the PDF, and it is
// designed for A4: 0.8cm of padding each side inside a bordered page, then tables
// of five to eight columns. In a phone-width iframe that leaves ~220px of content
// width, so the Grade column (and Position, and the last summary cell) is pushed
// past the page border and out of view. Reproduced against the backend's own
// template CSS before this was written — at 286px only Total was visible.
//
// The backend is read-only from here and the template is shared with the PDF, so
// the fix lives in the preview alone: scale the whole document down on narrow
// screens, so it lays out at the width it was designed for and is then drawn
// smaller. Everything shrinks together — text, padding, the bold template's
// negative-margin header — so no template needs special-casing. Shrinking the
// page padding instead was considered and rejected: bold_header's header bleeds
// to the border with a hard-coded -0.8cm margin, which no selector can scope to
// just that template, so it would have hung out past the frame.
//
// Checked in headless Chrome against all five templates, using the backend's
// real template CSS and a seven-column table, at 286px and 310px iframe widths.
//
// Media queries inside an iframe read the IFRAME's width, not the window's, so
// this only bites where the card is actually cramped and leaves a wide dialog
// untouched.

// The layout width to aim for, in CSS px. At 420 the widest realistic card —
// four score components plus Position, seven columns — fits without scrolling
// on a 360px phone; below it the classic and compact templates start to clip.
const DESIGN_WIDTH = 420;

// Tried at each step down, so the text is only ever as small as the width forces
// it to be. Steps rather than one continuous value because CSS can't divide a
// length by a length in a media query, and a single coarse scale (tried first)
// made a 286px card unreadably small.
const ZOOM_STEPS = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6];

// Rules are ordered widest-first so the narrowest matching query wins.
const FIT_CSS =
  ZOOM_STEPS.map(
    (zoom) => `@media (max-width:${Math.round(zoom * DESIGN_WIDTH)}px){html{zoom:${zoom}}}`,
  ).join("") +
  `@media (max-width:${DESIGN_WIDTH}px){` +
  // A card wider than even the scaled-down page (an unusual number of score
  // columns) scrolls inside its own border rather than hanging out of it.
  ".report-card-page{overflow-x:auto}" +
  // The compact template puts two tables side by side, which cannot both fit.
  ".two-col{flex-direction:column}" +
  "}";

const STYLE_TAG = `<style data-schoolos-fit>${FIT_CSS}</style>`;

export function fitReportCardPreview(html: string): string {
  // Last in <head> so it wins over the template's own rules at equal
  // specificity. A function replacer, not a string: html is untrusted input to
  // replace(), where "$&" and friends in a replacement string are special.
  return html.includes("</head>")
    ? html.replace("</head>", () => `${STYLE_TAG}</head>`)
    : STYLE_TAG + html;
}
