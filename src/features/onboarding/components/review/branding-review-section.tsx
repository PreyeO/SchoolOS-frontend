"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SchoolResponse } from "../../types";
import { BrandingSummary } from "../summaries/branding-summary";
import { ReviewSectionShell } from "./review-section-shell";
import { EditBrandingDialog } from "./edit-branding-dialog";

export function BrandingReviewSection({ school }: { school: SchoolResponse }) {
  return (
    <ReviewSectionShell title="Branding">
      <BrandingSummary school={school} />
      <EditBrandingDialog
        school={school}
        trigger={
          <Button type="button" variant="outline" size="sm">
            <Pencil className="size-3.5 mr-1" /> Edit
          </Button>
        }
      />
    </ReviewSectionShell>
  );
}
