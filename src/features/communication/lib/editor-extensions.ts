import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

// TipTap configured so it can only produce tags the backend keeps.
//
// The service bleach-cleans every body on save against this allowlist:
//   p br strong em u s ul ol li h1 h2 h3 h4 blockquote a span
// Anything else is stripped silently — no error, no warning, the formatting is
// simply gone the next time the notice is opened. So the editor must not be able
// to emit it in the first place.
//
// StarterKit v3 bundles three extensions that would break that rule, all
// disabled below:
//   code           → <code>       not on the allowlist
//   codeBlock      → <pre><code>  neither tag is on the allowlist
//   horizontalRule → <hr>         not on the allowlist
//
// Heading is capped at levels 1–4 for the same reason: h5 and h6 are not
// allowlisted, and StarterKit offers all six by default.
//
// Bold renders <strong> and Italic renders <em> (not <b>/<i>), which is the
// other half of why this is a real editor rather than execCommand — those two
// would have been stripped on every save.
//
// Link is bundled by StarterKit v3, so <a> works without a separate package.
// openOnClick is off: inside an editor a click means "put the caret here", not
// "leave the page I'm drafting".
export const ANNOUNCEMENT_EXTENSIONS = [
  StarterKit.configure({
    code: false,
    codeBlock: false,
    horizontalRule: false,
    heading: { levels: [1, 2, 3, 4] },
    link: {
      openOnClick: false,
      // Anything the backend won't keep on an <a> is pointless to emit. rel and
      // target are both allowlisted, and noopener matters on target="_blank".
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    },
  }),
  // Ships in @tiptap/extensions but is NOT enabled by StarterKit, so it has to
  // be added by hand. Renders through the .prose-announcement placeholder rule
  // in globals.css — an empty editor is otherwise a blank box with no prompt.
  Placeholder.configure({
    placeholder: "Write the notice — what's happening, when, and what to do.",
  }),
];

// TipTap represents an empty document as "<p></p>", which is truthy and would
// pass a naive required-field check. Strip tags and entities to decide whether
// anything was actually written.
export function isEditorEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length === 0;
}
