import { z } from "zod";

// The one password rule for every form that sets a password: signup, reset,
// accept-invite, add-student and the admin reissue.
//
// Mirrors the backend, which since 2026-10-09 (6f91d3d) accepts any password:
// AUTH_PASSWORD_VALIDATORS is empty and the serializers' min_length=8 is gone.
// The only rule left is DRF's CharField default of allow_blank=False, so an
// empty string still 400s, and that's all this checks. Five schemas used to
// each carry their own copy of an 8-char/upper/lower/digit/symbol rule, which
// would now reject passwords the server accepts. Change it here if a minimum
// ever comes back.
export const passwordField = z.string().min(1, "Enter a password");
