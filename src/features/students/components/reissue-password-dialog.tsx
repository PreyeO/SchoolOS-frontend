"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { FieldWrapper } from "@/features/auth/components/field-wrapper";
import { PasswordInput } from "@/features/auth/components/password-input";

import { useReissuePassword } from "../hooks/use-reissue-password";
import { reissuePasswordSchema, type ReissuePasswordFormValues } from "../schemas/reissue-password-schema";

export function ReissuePasswordDialog({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const reissue = useReissuePassword(studentId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReissuePasswordFormValues>({
    resolver: zodResolver(reissuePasswordSchema),
    defaultValues: { password: "" },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) reset({ password: "" });
  }

  async function submit(values: ReissuePasswordFormValues) {
    try {
      await reissue.mutateAsync(values.password);
      setOpen(false);
    } catch {
      // Error already toasted by the mutation.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Reissue password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reissue password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FieldWrapper id="reissue-password" label="New password" error={errors.password?.message} required>
            <PasswordInput
              id="reissue-password"
              autoComplete="new-password"
              hasError={!!errors.password}
              describedBy={errors.password ? "reissue-password-error" : undefined}
              {...register("password")}
            />
          </FieldWrapper>
          <p className="text-xs text-n-400">
            Share this password with the student directly — it won&rsquo;t be shown again.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={reissue.isPending}>
              {reissue.isPending ? "Saving…" : "Reissue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
