// Shape shared by the three legal pages (privacy, terms, data protection).
//
// Content lives in data/ rather than inside the components, per the same rule
// as the rest of the marketing copy: these get reviewed and edited by people
// who should not have to open a .tsx file to change a sentence.
export interface LegalSection {
  // Also the anchor id, so a clause can be linked to directly — which is the
  // whole point of numbered sections in a policy.
  id: string;
  heading: string;
  body: string[];
  // Rendered as a bulleted list after the body paragraphs.
  list?: string[];
  // Set apart in a bordered callout. For the things a reader must not miss —
  // typically a limitation of what the product can currently do.
  callout?: string;
}

export interface LegalDocument {
  title: string;
  // One sentence under the title saying who the document is for. These three
  // have different audiences and saying so up front saves the wrong person
  // reading the wrong page.
  summary: string;
  effective: string;
  sections: LegalSection[];
  // Optional closing line naming the legal entity behind SchoolOS, rendered
  // small and set apart below the last section. Optional because not every
  // document needs it stated twice — Terms and Data Protection already name
  // the operator in their own sections.
  footer?: string;
}
