"use client";

import { useState } from "react";
import { Camera } from "lucide-react";

import { PersonAvatar } from "@/components/shared/person-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/features/uploads/components/image-upload-field";

import { useUpdateStudent } from "../hooks/use-update-student";
import { studentPhoto } from "../lib/student-photo";
import type { StudentDetail } from "../types";

// The photo control lives ON the photo, not in a form. It was first put inside
// the About dialog beside favourite food and hobbies, which is where the field
// technically belongs in the API's whitelist but not where anyone looks for it:
// there was no affordance anywhere near the avatar, so the feature read as
// missing. You change a picture by clicking the picture.
export function EditStudentPhotoDialog({ student }: { student: StudentDetail }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  // undefined until a file is picked or the photo is removed, so closing
  // without touching anything sends no photo_key at all.
  const [photoKey, setPhotoKey] = useState<string | null | undefined>(undefined);
  const update = useUpdateStudent(student.id);

  const { first_name, last_name } = student.user;
  const name = `${first_name} ${last_name}`;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setPhotoKey(undefined);
  }

  async function save() {
    if (photoKey === undefined) {
      setOpen(false);
      return;
    }
    try {
      await update.mutateAsync({ photo_key: photoKey });
      setOpen(false);
    } catch {
      // Already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`Change ${name}'s photo`}
        >
          <PersonAvatar firstName={first_name} lastName={last_name} photo={studentPhoto(student)} className="size-14" />
          {/* Always visible, not hover-only — a hover-only affordance doesn't
              exist on a phone, and this page is opened on one constantly. */}
          <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border-2 border-white bg-n-100 text-n-600 transition-colors group-hover:bg-primary group-hover:text-white">
            <Camera className="size-3" aria-hidden="true" />
          </span>
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Student photo</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-sm text-n-500">{name}</p>

        <ImageUploadField
          id="student-photo"
          prefix="student-photos"
          label="photo"
          shape="circle"
          currentUrl={student.photo}
          onChange={setPhotoKey}
          onUploadingChange={setUploading}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={save} disabled={update.isPending || uploading}>
            {uploading ? "Uploading…" : update.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
