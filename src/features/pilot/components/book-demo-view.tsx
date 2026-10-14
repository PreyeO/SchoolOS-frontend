"use client";

import { useState } from "react";

import { Container } from "@/components/layout/Container";

import { BookDemoForm } from "./book-demo-form";
import { BookDemoIntro } from "./book-demo-intro";
import { BookDemoSuccess } from "./book-demo-success";

// Two columns on desktop, stacked on mobile with the pitch first — on a phone
// the reader needs to know what they're signing up for before the fields.
//
// The submitted first name is the only state kept: it's the difference between
// a generic confirmation and one addressed to the person who just wrote it.
export function BookDemoView() {
  const [firstName, setFirstName] = useState<string | null>(null);

  return (
    <section className="py-14 md:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <BookDemoIntro />

          <div className="lg:pt-1">
            {firstName ? (
              <BookDemoSuccess firstName={firstName} />
            ) : (
              <div className="rounded-2xl border border-n-200 bg-white p-5 sm:p-6">
                <BookDemoForm onDone={setFirstName} />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
