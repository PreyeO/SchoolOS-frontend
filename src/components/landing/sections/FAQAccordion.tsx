"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/data/faq";

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem key={i} value={`item-${i}`} className="border-b border-n-200">
          <AccordionTrigger className="py-5 text-left font-medium text-ink hover:no-underline hover:text-brand transition-colors">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-n-600 leading-relaxed">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
