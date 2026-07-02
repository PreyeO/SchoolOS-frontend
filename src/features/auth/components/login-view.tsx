"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth-store";
import { getCurrentSchoolSlug } from "@/lib/tenant/get-current-school-slug";
import { consumeSessionExpiredFlag } from "@/lib/api/client";

import { useLogin } from "../hooks/use-login";
import { LoginForm } from "./login-form";
import { SchoolSelector } from "./school-selector";
import type { LoginFormValues } from "../schemas/login-schema";
import type { SchoolSummary } from "../types";

export function LoginView() {
  const router = useRouter();
  const tokens = useAuthStore((s) => s.tokens);

  const [creds, setCreds] = useState<LoginFormValues | null>(null);
  const [schools, setSchools] = useState<SchoolSummary[] | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const { mutate, isPending } = useLogin({ onSelectionNeeded: setSchools });

  // Guard: an already-authenticated user shouldn't see the login page.
  useEffect(() => {
    if (tokens) router.replace("/dashboard");
  }, [tokens, router]);

  // A forced logout (expired refresh token) redirects here and sets this flag.
  useEffect(() => {
    if (consumeSessionExpiredFlag()) {
      toast.error("Your session expired — please log in again.");
    }
  }, []);

  if (tokens) return null;

  function handleCredentials(values: LoginFormValues) {
    setCreds(values);
    const slug = getCurrentSchoolSlug();
    mutate({
      identifier: values.identifier,
      password: values.password,
      // On a school subdomain, scope automatically; otherwise let selection handle it.
      ...(slug ? { school_slug: slug } : {}),
    });
  }

  function handlePick(slug: string) {
    if (!creds) return;
    setPendingSlug(slug);
    mutate(
      { identifier: creds.identifier, password: creds.password, school_slug: slug },
      { onError: () => setPendingSlug(null) },
    );
  }

  if (schools) {
    return (
      <>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink">Choose a school</h1>
          <p className="mt-2 text-n-500">
            You belong to more than one school. Pick one to continue.
          </p>
        </div>
        <SchoolSelector
          schools={schools}
          pending={isPending}
          pendingSlug={pendingSlug}
          onPick={handlePick}
          onBack={() => {
            setSchools(null);
            setPendingSlug(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">Welcome back</h1>
        <p className="mt-2 text-n-500">Log in to your SchoolOS account.</p>
      </div>

      <LoginForm
        defaultIdentifier={creds?.identifier}
        isPending={isPending}
        onSubmit={handleCredentials}
      />

      <p className="mt-6 text-center text-sm text-n-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-brand hover:text-brand/80 underline underline-offset-4"
        >
          Sign up free
        </Link>
      </p>
    </>
  );
}
