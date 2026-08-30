import { apiClient } from "@/lib/api/client";
import { PILOT_ENDPOINTS } from "@/lib/api/endpoints";

import type { DemoRequestPayload } from "../types";

// Declared here rather than imported from the invitations feature (which owns
// the app's DetailResponse): this endpoint is unconfirmed, so its response
// shape is an assumption too, and it shouldn't tie a marketing page to another
// feature's types. Nothing reads the body — success is a UI state, and errors
// go through the shared normalizer, which handles any { detail } shape.
interface DemoRequestResponse {
  detail?: string;
}

// TODO confirm endpoint with backend.
//
// POST /api/demo-requests/ does not exist yet — verified live (404) and against
// the router registry. The payload shape below is likewise an assumption.
//
// This is the entire integration surface for the pilot form: one function, one
// payload type, one endpoint constant. Repointing it at a real endpoint, a form
// service, or a webhook is a change to this file alone — no component, hook or
// schema needs to know.
//
// No Authorization header: the route is public, and PILOT_ENDPOINTS.DEMO_REQUEST
// is in client.ts's PUBLIC_PATHS so a signed-in admin filling this in doesn't
// attach their token to a marketing submission.
export async function submitDemoRequest(payload: DemoRequestPayload): Promise<DemoRequestResponse> {
  const { data } = await apiClient.post<DemoRequestResponse>(PILOT_ENDPOINTS.DEMO_REQUEST, payload);
  return data;
}
