"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LogoUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
}

export function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(file: File | null) {
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />
      {preview || value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview ?? undefined}
            alt="School logo preview"
            className="h-20 w-20 rounded-xl object-cover border border-n-200"
          />
          <button
            type="button"
            onClick={() => {
              handleFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-clay text-white"
            aria-label="Remove logo"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl",
            "border-2 border-dashed border-n-300 text-n-400 transition-colors",
            "hover:border-brand hover:text-brand",
          )}
        >
          <ImagePlus className="size-6" />
          <span className="text-[10px]">Upload</span>
        </button>
      )}
      {(preview || value) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-n-400"
          onClick={() => inputRef.current?.click()}
        >
          Change logo
        </Button>
      )}
    </div>
  );
}
