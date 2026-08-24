"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  editor: Editor;
  onLinkClick: () => void;
}

function ToolButton({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: typeof Bold;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      // onMouseDown, not onClick: the default mousedown blurs the editor and
      // collapses the selection, so a click would apply formatting to nothing.
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-n-500 transition-colors",
        "hover:bg-n-100 hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        isActive && "bg-primary/10 text-primary",
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

// Only the formatting the backend actually keeps. Every button here maps to an
// allowlisted tag — see editor-extensions.ts for what was deliberately left out.
export function EditorToolbar({ editor, onLinkClick }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-n-200 px-1.5 py-1">
      <ToolButton
        label="Bold"
        icon={Bold}
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolButton
        label="Italic"
        icon={Italic}
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolButton
        label="Underline"
        icon={Underline}
        isActive={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolButton
        label="Strikethrough"
        icon={Strikethrough}
        isActive={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <span className="mx-1 h-4 w-px bg-n-200" />

      <ToolButton
        label="Heading"
        icon={Heading2}
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolButton
        label="Subheading"
        icon={Heading3}
        isActive={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <span className="mx-1 h-4 w-px bg-n-200" />

      <ToolButton
        label="Bulleted list"
        icon={List}
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolButton
        label="Numbered list"
        icon={ListOrdered}
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolButton
        label="Quote"
        icon={Quote}
        isActive={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <span className="mx-1 h-4 w-px bg-n-200" />

      <ToolButton
        label="Link"
        icon={Link2}
        isActive={editor.isActive("link")}
        onClick={onLinkClick}
      />
    </div>
  );
}
