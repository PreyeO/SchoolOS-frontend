"use client";

import { useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import { cn } from "@/lib/utils";

import { ANNOUNCEMENT_EXTENSIONS } from "../lib/editor-extensions";
import { EditorToolbar } from "./editor-toolbar";

interface Props {
  value: string;
  onChange: (html: string) => void;
  hasError?: boolean;
  ariaLabel: string;
}

export function RichTextEditor({ value, onChange, hasError, ariaLabel }: Props) {
  const editor = useEditor({
    extensions: ANNOUNCEMENT_EXTENSIONS,
    content: value,
    // Next renders this on the server first; without the flag TipTap warns about
    // a hydration mismatch, since ProseMirror's DOM only exists on the client.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": ariaLabel,
        class:
          "prose-announcement min-h-40 max-h-96 overflow-y-auto px-3 py-2.5 text-base md:text-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Deliberately one-way: `value` seeds the editor and is never pushed back in
  // on re-render. TipTap owns the document once mounted, and setting content
  // from a prop on every keystroke would fight the caret. The dialog remounts
  // this component per open (see its `key`), which is what re-seeds it for edit.
  const setLink = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", existing ?? "https://");

    // Cancelled — leave whatever is there alone. Distinct from clearing it.
    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  if (!editor) {
    return <div className="h-52 rounded-lg border border-input bg-n-50" aria-hidden />;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-transparent transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        hasError && "border-destructive",
      )}
    >
      <EditorToolbar editor={editor} onLinkClick={setLink} />
      <EditorContent editor={editor} />
    </div>
  );
}
