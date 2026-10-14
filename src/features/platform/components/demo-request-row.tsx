"use client";

import { useState } from "react";
import { ChevronDown, Mail, MessageSquare, Phone } from "lucide-react";

import { SCHOOL_LEVELS } from "@/data/school-levels";
import { NIGERIAN_STATES } from "@/data/nigerian-states";
import { PILOT_ROLES, STUDENT_RANGES, CONTACT_TIMES } from "@/data/pilot";
import { formatIsoDate } from "@/lib/text/format-date";

import type { DemoRequest } from "../types-demo-requests";
import { DemoRequestStatusSelect } from "./demo-request-status";

const label = (list: readonly { value: string; label: string }[], value: string) =>
  list.find((x) => x.value === value)?.label ?? value;

export function DemoRequestRow({ request }: { request: DemoRequest }) {
  const [open, setOpen] = useState(false);
  const levels = request.levels.map((l) => label(SCHOOL_LEVELS, l)).join(", ");

  return (
    <>
      <tr className="border-b border-n-100 last:border-0 align-top">
        <td className="px-3 py-3">
          <p className="font-medium text-ink">{request.school_name}</p>
          <p className="mt-0.5 text-xs text-n-500">
            {request.city}, {label(NIGERIAN_STATES, request.state)}
          </p>
        </td>
        <td className="px-3 py-3">
          <p className="text-ink">{request.full_name}</p>
          <p className="mt-0.5 text-xs text-n-500">{label(PILOT_ROLES, request.role)}</p>
        </td>
        <td className="px-3 py-3">
          {/* Both are tap-to-act. This screen exists so someone can follow a
              lead up, and the follow-up is a call or an email. */}
          <a href={`tel:${request.phone_number}`} className="flex items-center gap-1.5 text-ink hover:text-primary">
            <Phone className="size-3 shrink-0 text-n-400" />
            {request.phone_number}
          </a>
          <a href={`mailto:${request.email}`} className="mt-0.5 flex items-center gap-1.5 text-xs text-n-500 hover:text-primary">
            <Mail className="size-3 shrink-0" />
            <span className="truncate">{request.email}</span>
          </a>
        </td>
        <td className="px-3 py-3 text-n-600">{label(STUDENT_RANGES, request.student_range)}</td>
        <td className="px-3 py-3 text-xs text-n-500">{formatIsoDate(request.created_at)}</td>
        <td className="px-3 py-3">
          <DemoRequestStatusSelect id={request.id} status={request.status} />
        </td>
        <td className="px-3 py-3 text-right">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Hide details" : "Show details"}
            className="rounded-lg p-1.5 text-n-400 transition-colors hover:bg-n-100 hover:text-ink"
          >
            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </td>
      </tr>

      {open && (
        <tr className="border-b border-n-100 bg-n-50/60">
          <td colSpan={7} className="px-3 py-3">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-n-400">Levels</dt>
                <dd className="text-sm text-ink">{levels}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-n-400">Best time to call</dt>
                <dd className="text-sm text-ink">
                  {request.best_time_to_call ? label(CONTACT_TIMES, request.best_time_to_call) : "Any time"}
                </dd>
              </div>
            </dl>
            {/* The only free text on the form, and usually the most useful
                thing on the lead — shown in full rather than truncated. */}
            {request.message && (
              <div className="mt-3 flex gap-2 rounded-lg border border-n-200 bg-white p-3">
                <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-n-400" />
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-n-600">
                  {request.message}
                </p>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
