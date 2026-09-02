"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useImageUpload } from "../hooks/use-image-upload";
import { ACCEPT_ATTRIBUTE, MAX_UPLOAD_BYTES, formatBytes } from "../lib/validate-image";
import type { UploadPrefix } from "../types";

interface Props {
  id: string;
  prefix: UploadPrefix;
  // The presigned GET URL currently stored on the resource, shown until a new
  // file is picked. Null when nothing is set.
  currentUrl?: string | null;
  // Receives the S3 key to submit as logo_key / photo_key, or null to clear.
  onChange: (key: string | null) => void;
  // Lets the parent form disable Save while bytes are still in flight. Saving
  // mid-upload would persist the PREVIOUS key, which reads as the upload
  // silently doing nothing.
  onUploadingChange?: (isUploading: boolean) => void;
  label: string;
  shape?: "square" | "circle";
  disabled?: boolean;
  describedBy?: string;
}

export function ImageUploadField({
  id,
  prefix,
  currentUrl,
  onChange,
  onUploadingChange,
  label,
  shape = "square",
  disabled,
  describedBy,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Tracks whether the stored image was explicitly removed, so the preview
  // doesn't fall back to currentUrl after a clear — the resource still carries
  // the old URL until the form is saved.
  const [cleared, setCleared] = useState(false);
  const { isUploading, error, previewUrl, upload, clear } = useImageUpload({
    prefix,
    onUploaded: onChange,
  });

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  // Blob preview wins while one exists; otherwise the saved image, unless it
  // was cleared this session.
  const shown = previewUrl ?? (cleared ? null : currentUrl);
  const hasImage = !!shown;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div
          className={`relative flex size-16 shrink-0 items-center justify-center overflow-hidden border border-n-200 bg-n-50 ${
            shape === "circle" ? "rounded-full" : "rounded-xl"
          }`}
        >
          {hasImage ? (
            // Plain <img>: these are presigned S3 URLs on a signed, expiring
            // host, which next/image would need configured as a remote pattern
            // — and the signature makes its optimizer cache useless anyway.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <ImageOff className="size-5 text-n-300" aria-hidden="true" />
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
              <Loader2 className="size-5 animate-spin text-white" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            className="sr-only"
            disabled={disabled || isUploading}
            aria-describedby={describedBy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              // Reset the input's value so re-picking the same file after a
              // failure fires change again — without it, the second attempt at
              // an identical path is silently ignored by the browser.
              e.target.value = "";
              if (!file) return;
              setCleared(false);
              void upload(file);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              {isUploading ? "Uploading…" : hasImage ? `Replace ${label}` : `Upload ${label}`}
            </Button>
            {hasImage && !isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  setCleared(true);
                  clear();
                }}
              >
                <X className="size-3.5" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-n-400">
            PNG, JPG, WebP or GIF, up to {formatBytes(MAX_UPLOAD_BYTES)}.
          </p>
        </div>
      </div>

      {/* aria-live so a rejection reaches a screen reader: the file dialog has
          closed by the time this renders, and focus is back on the button. */}
      {error && (
        <p className="text-xs text-clay" role="status" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
