"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLES_DATA } from "@/data/by-role";
import { CheckIcon } from "lucide-react";

export function ByRoleTabs() {
  return (
    <Tabs defaultValue={ROLES_DATA[0].id}>
      <TabsList className="mb-10 flex h-auto w-full flex-wrap gap-2 rounded-none border-b border-n-200 bg-transparent p-0">
        {ROLES_DATA.map((role) => (
          <TabsTrigger
            key={role.id}
            value={role.id}
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 font-medium text-n-500 transition-colors data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:shadow-none"
          >
            {role.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {ROLES_DATA.map((role) => (
        <TabsContent key={role.id} value={role.id} className="mt-0">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-4 leading-snug">
                {role.heading}
              </h3>
              <p className="text-n-600 text-lg leading-relaxed">{role.body}</p>
            </div>

            <ul className="space-y-3">
              {role.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grass/15">
                    <CheckIcon className="h-3 w-3 text-grass" aria-hidden="true" />
                  </span>
                  <span className="text-ink">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
