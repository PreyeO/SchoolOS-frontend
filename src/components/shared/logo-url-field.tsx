"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { Input } from "@/components/ui/input";

// TODO: restore file upload when hosting is ready — logo is a plain URL for now.
interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  describedBy?: string;
}

export function LogoUrlField({ id, value, onChange, hasError, describedBy }: Props) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-n-200 bg-n-50 overflow-hidden">
        {value && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="School logo preview"
            className="size-full object-cover"
            onError={() => setBroken(true)}
            onLoad={() => setBroken(false)}
          />
        ) : (
          <ImageOff className="size-5 text-n-300" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <Input
          id={id}
          type="url"
          inputMode="url"
          placeholder="https://example.com/logo.png"
          value={value}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            setBroken(false);
            onChange(e.target.value);
          }}
        />
        {broken && value && (
          <p className="text-xs text-clay" role="status">
            Couldn&rsquo;t load an image from that URL.
          </p>
        )}
      </div>
    </div>
  );
}
