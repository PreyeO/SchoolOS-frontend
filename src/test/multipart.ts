// The name of the file in a multipart upload, read from the raw body.
//
// Not request.formData(): under jsdom, a FormData built from a jsdom File
// reaches MSW as a correct multipart body (boundary and all), but undici's
// formData() parser trips an internal assertion on it ("The expression
// evaluated to a falsy value" during handler lookup), and the handler never
// answers. Reading the text sidesteps the parser and still proves the file
// was sent as multipart rather than JSON-stringified to {}.
export async function uploadedFileName(request: Request, field = "file"): Promise<string | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) return null;
  const body = await request.text();
  const match = body.match(new RegExp(`name="${field}"; filename="([^"]*)"`));
  return match ? match[1] : null;
}
