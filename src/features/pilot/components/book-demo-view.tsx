"use client";

import { useState } from "react";

import { Container } from "@/components/layout/Container";

import { BookDemoForm } from "./book-demo-form";
import { BookDemoIntro } from "./book-demo-intro";
import { BookDemoSuccess } from "./book-demo-success";

// Two columns on desktop, stacked on mobile with the pitch first — on a phone
// the reader needs to know what they're signing up for before the fields.
//
// Keeps just enough of the submission to make the confirmation specific: the
// visitor's first name, and the channel they asked to be reached on.
export function BookDemoView() {
  const [done, setDone] = useState<{ firstName: string; channel: string } | null>(null);

  return (
    <section className="py-14 md:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <BookDemoIntro />

          <div className="lg:pt-1">
            {done ? (
              <BookDemoSuccess firstName={done.firstName} channel={done.channel} />
            ) : (
              <div className="rounded-2xl border border-n-200 bg-white p-5 sm:p-6">
                <BookDemoForm onDone={(firstName, channel) => setDone({ firstName, channel })} />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
