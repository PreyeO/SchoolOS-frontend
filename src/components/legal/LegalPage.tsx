import { Container } from "@/components/layout/Container";
import type { LegalDocument } from "@/data/legal/types";
import { LegalRichText } from "./legal-rich-text";

// One shell for all three legal pages. Deliberately plain: a policy is read to
// find a specific clause, so the layout's whole job is a readable measure, a
// visible section number, and a heading you can link to.
export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <Container>
      <article className="mx-auto max-w-3xl py-12 md:py-16">
        <header className="border-b border-n-200 pb-8">
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">{doc.title}</h1>
          <p className="mt-3 text-lg leading-relaxed text-n-600">{doc.summary}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-n-400">
            Effective {doc.effective}
          </p>
        </header>

        {/* Contents. A policy without one is a policy nobody navigates — and
            these anchors are what a school's lawyer will cite back at us. */}
        <nav aria-label="Contents" className="border-b border-n-200 py-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-n-400">Contents</p>
          <ol className="space-y-1.5">
            {doc.sections.map((section, i) => (
              <li key={section.id} className="text-sm">
                <a
                  href={`#${section.id}`}
                  className="text-n-600 underline-offset-4 hover:text-primary hover:underline"
                >
                  <span className="font-mono text-xs text-n-400">{i + 1}.</span> {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="divide-y divide-n-200">
          {doc.sections.map((section, i) => (
            // scroll-mt-24 for the same reason the landing sections carry it:
            // the Navbar is fixed, so without it an anchor lands with the
            // heading hidden underneath the header.
            <section key={section.id} id={section.id} className="scroll-mt-24 py-8">
              <h2 className="font-display text-xl font-semibold text-ink">
                <span className="mr-2 font-mono text-sm text-n-400">{i + 1}.</span>
                {section.heading}
              </h2>

              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed text-n-600">
                    <LegalRichText text={paragraph} />
                  </p>
                ))}
              </div>

              {section.list && (
                <ul className="mt-4 space-y-2">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-2.5 leading-relaxed text-n-600">
                      <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-n-400" />
                      <span>
                        <LegalRichText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {section.callout && (
                <p className="mt-5 rounded-xl border border-amber/40 bg-amber/5 p-4 text-sm leading-relaxed text-ink">
                  <LegalRichText text={section.callout} />
                </p>
              )}
            </section>
          ))}
        </div>

        {doc.footer && (
          <p className="mt-8 border-t border-n-200 pt-6 text-xs italic text-n-400">
            <LegalRichText text={doc.footer} />
          </p>
        )}
      </article>
    </Container>
  );
}
