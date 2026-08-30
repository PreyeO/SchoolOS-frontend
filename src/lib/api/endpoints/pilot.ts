// ⚠️ TODO confirm endpoint with backend — this path does NOT exist yet.
//
// Verified against the live server and the router registry: POST
// /api/demo-requests/ returns 404, and nothing in the backend registers a
// demo/pilot/lead route. It is an assumption, not a contract.
//
// Isolated here (and behind a single API function) so that pointing the form
// at whatever ships — a different path, a form service, a webhook — is a
// one-line change and touches no component.
//
// PUBLIC: no Bearer token. Listed in client.ts's PUBLIC_PATHS so a signed-in
// admin filling this in doesn't send their credentials with it.
export const PILOT_ENDPOINTS = {
  DEMO_REQUEST: "/api/demo-requests/",
} as const;
