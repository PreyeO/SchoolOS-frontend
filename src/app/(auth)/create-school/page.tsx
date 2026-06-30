import type { Metadata } from "next";
import Link from "next/link";

import { CreateSchoolForm } from "@/features/auth/components/create-school-form";

export const metadata: Metadata = { title: "Set up your school" };

export default function CreateSchoolPage() {
  return (
    <div className="py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="lg:hidden inline-block font-display text-xl font-bold text-ink tracking-tight mb-8"
          >
            School<span className="text-brand">OS</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink">
            Set up your school
          </h1>
          <p className="mt-2 text-n-500">
            Add your school details. This takes about 2 minutes.
          </p>
        </div>

        <CreateSchoolForm />
      </div>
    </div>
  );
}
