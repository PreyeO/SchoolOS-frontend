"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { requestPresignedUpload, uploadToS3 } from "../api/uploads-api";
import { validateImage } from "../lib/validate-image";
import type { UploadPrefix } from "../types";

interface Options {
  prefix: UploadPrefix;
  // Called with the S3 key once the file has actually landed, or null when the
  // asset is cleared. Only ever called for the most recent pick.
  onUploaded: (key: string | null) => void;
}

interface UploadState {
  isUploading: boolean;
  error: string | null;
  // Object URL for the file being uploaded, so the preview is instant rather
  // than waiting on a presigned read URL that doesn't exist until after save.
  previewUrl: string | null;
}

export function useImageUpload({ prefix, onUploaded }: Options) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    error: null,
    previewUrl: null,
  });

  // Every pick increments this. An async step that resolves against a stale
  // generation is a pick the user has already replaced, so its key is dropped
  // rather than attached — docs/storage.md's "abandon the in-flight upload" rule.
  // Without it, picking B while A is still uploading can save A's key, because
  // A's promise resolves last.
  const generation = useRef(0);
  const abort = useRef<AbortController | null>(null);
  // Tracked separately from state so cleanup can revoke without depending on a
  // render — a blob URL held past its preview is a leak for the tab's lifetime.
  const objectUrl = useRef<string | null>(null);

  const releasePreview = useCallback(() => {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      abort.current?.abort();
      releasePreview();
    };
  }, [releasePreview]);

  const clear = useCallback(() => {
    generation.current += 1;
    abort.current?.abort();
    releasePreview();
    setState({ isUploading: false, error: null, previewUrl: null });
    // Null clears the asset server-side; the backend skips its S3 HEAD for an
    // empty key, so this needs no upload of its own.
    onUploaded(null);
  }, [onUploaded, releasePreview]);

  const upload = useCallback(
    async (file: File) => {
      const mine = ++generation.current;
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;

      const invalid = validateImage(file);
      if (invalid) {
        releasePreview();
        setState({ isUploading: false, error: invalid, previewUrl: null });
        return;
      }

      releasePreview();
      const preview = URL.createObjectURL(file);
      objectUrl.current = preview;
      setState({ isUploading: true, error: null, previewUrl: preview });

      try {
        const presigned = await requestPresignedUpload({
          prefix,
          filename: file.name,
          content_type: file.type,
        });
        if (generation.current !== mine) return;

        await uploadToS3(presigned, file, controller.signal);
        if (generation.current !== mine) return;

        setState((s) => ({ ...s, isUploading: false }));
        // Only now is the key real. Before S3 confirms, it is a reservation.
        onUploaded(presigned.key);
      } catch (error) {
        // An abort is a deliberate replacement, not a failure to report.
        if (controller.signal.aborted || generation.current !== mine) return;
        releasePreview();
        setState({
          isUploading: false,
          // A CORS rejection from the bucket arrives as a bare TypeError with
          // no response, so getErrorMessage has nothing useful to say about it.
          error: error instanceof TypeError ? "Couldn't reach the file store. Try again." : getErrorMessage(error),
          previewUrl: null,
        });
      }
    },
    [prefix, onUploaded, releasePreview],
  );

  return { ...state, upload, clear };
}
