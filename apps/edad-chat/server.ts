/**
 * Standalone Bun server for the edad-chat container deployment.
 *
 * Same wire behavior as the Next.js `api/proxy.ts` handler — this exists
 * so eDad-chat can run as a single ECS task on eliza cloud (image →
 * /api/v1/containers) instead of relying on a wrapping host app.
 *
 * Routes:
 *   GET  /                  → public/index.html
 *   GET  /style.css, etc.   → public/* static
 *   GET  /api/config        → non-secret OAuth config (app_id, cloud_url)
 *   *    /api/<path>        → forwarded to ELIZA_API_BASE with the user's
 *                             Steward JWT (x-user-token) as Bearer auth
 *   GET  /health            → "ok" for container health probes
 */

import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 3000);
const PUBLIC_DIR = join(import.meta.dir, "public");

const CLOUD_URL = (process.env.ELIZA_CLOUD_URL ?? "https://www.elizacloud.ai").replace(/\/+$/, "");
const UPSTREAM = (process.env.ELIZA_API_BASE ?? `${CLOUD_URL}/api/v1`).replace(/\/+$/, "");
const AFFILIATE_CODE = process.env.ELIZA_AFFILIATE_CODE ?? "";
const APP_ID = process.env.ELIZA_APP_ID ?? "";

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function handleApi(req: Request, segments: string[]): Promise<Response> {
  if (segments.length === 1 && segments[0] === "config") {
    return Response.json(
      { app_id: APP_ID || null, cloud_url: CLOUD_URL, affiliate_code: AFFILIATE_CODE },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const userToken = req.headers.get("x-user-token")?.trim();
  if (!userToken) {
    return jsonError(
      401,
      "not_signed_in",
      "dad needs you to sign in with eliza cloud first, champ. hit the sign-in button up top.",
    );
  }

  const fwd: Record<string, string> = {
    "content-type": req.headers.get("content-type") ?? "application/json",
    "anthropic-version": "2023-06-01",
    authorization: `Bearer ${userToken}`,
  };
  if (AFFILIATE_CODE) fwd["x-affiliate-code"] = AFFILIATE_CODE;
  if (APP_ID) fwd["x-app-id"] = APP_ID;

  const target = `${UPSTREAM}/${segments.join("/")}${new URL(req.url).search}`;
  const init: RequestInit = { method: req.method, headers: fwd };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  try {
    const res = await fetch(target, init);
    const body = await res.arrayBuffer();
    return new Response(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return jsonError(502, "upstream_unreachable", "eliza cloud didn't answer the phone. try again in a sec.");
  }
}

async function serveStatic(pathname: string): Promise<Response | null> {
  const target = pathname === "/" ? "/index.html" : pathname;
  // Reject anything trying to break out of public/.
  if (target.includes("..") || !target.startsWith("/")) return null;
  const file = Bun.file(join(PUBLIC_DIR, target));
  if (!(await file.exists())) return null;
  return new Response(file, { headers: { "cache-control": "no-store" } });
}

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return new Response("ok", { headers: { "content-type": "text/plain" } });
    }

    if (url.pathname.startsWith("/api/")) {
      const segments = url.pathname.slice("/api/".length).split("/").filter((s) => s !== "");
      if (!segments.length || segments.some((s) => s.includes(".."))) {
        return jsonError(404, "not_found", "unknown route");
      }
      return handleApi(req, segments);
    }

    const staticRes = await serveStatic(url.pathname);
    if (staticRes) return staticRes;

    return new Response("not found", { status: 404 });
  },
});

console.log(`[edad-chat] listening on http://${server.hostname}:${server.port}`);
console.log(`[edad-chat] upstream: ${UPSTREAM}`);
console.log(`[edad-chat] app_id: ${APP_ID || "(unset)"} affiliate: ${AFFILIATE_CODE || "(unset)"}`);
