export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message && err.message !== "{}") return err.message;
  if (typeof err === "string" && err) return err;
  if (err && typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    for (const key of ["message", "msg", "error", "statusText"]) {
      const value = anyErr[key];
      if (typeof value === "string" && value && value !== "{}") return value;
    }
    const body = anyErr["body"] ?? anyErr["data"];
    if (body && typeof body === "object") {
      const nested = (body as Record<string, unknown>)["message"];
      if (typeof nested === "string" && nested) return nested;
    }
  }
  return fallback;
}
