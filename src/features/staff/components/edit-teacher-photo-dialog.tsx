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

import { useUpdateTeacher } from "../hooks/use-update-teacher";

interface Props {
  teacherId: string;
  firstName: string;
  lastName: string;
  // user.photo — a presigned URL, or null.
  photo: string | null;
  // Avatar size class; the profile page shows a larger one than /staff/:id.
  className?: string;
}

// The teacher's photo is User.photo_key, written through PATCH /teachers/:id/
// — the first write path User photos have had, and so the first use of the
// "user-photos" upload prefix. Same shape as EditStudentPhotoDialog: the
// avatar IS the control, with an always-visible camera badge (no hover on a
// phone). Used by an edit_staff admin on /staff/:id and by the teacher on
// their own /profile.
export function EditTeacherPhotoDialog({ teacherId, firstName, lastName, photo, className = "size-14" }: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  // undefined until a file is picked or removed, so Save with no change sends
  // nothing. null (removed) is sent as "" — the serializer's way to clear it.
  const [photoKey, setPhotoKey] = useState<string | null | undefined>(undefined);
  const update = useUpdateTeacher(teacherId);
  const name = `${firstName} ${lastName}`;

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
      await update.mutateAsync({ photo_key: photoKey ?? "" });
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
          <PersonAvatar firstName={firstName} lastName={lastName} photo={photo} className={className} />
          <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border-2 border-white bg-n-100 text-n-600 transition-colors group-hover:bg-primary group-hover:text-white">
            <Camera className="size-3" aria-hidden="true" />
          </span>
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile photo</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-sm text-n-500">{name}</p>

        <ImageUploadField
          id="teacher-photo"
          prefix="user-photos"
          label="photo"
          shape="circle"
          currentUrl={photo}
          onChange={setPhotoKey}
          onUploadingChange={setUploading}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={save} disabled={update.isPending || uploading}>
            {uploading ? "Uploading…" : update.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
