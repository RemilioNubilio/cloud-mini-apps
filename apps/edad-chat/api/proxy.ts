/**
 * eDad ↔ eliza cloud proxy.
 *
 * Forwards /apps/edad/api/* to ELIZA_API_BASE (default https://www.elizacloud.ai/api/v1).
 *
 * The one special route handled locally is `/apps/edad/api/config`, which returns
 * non-secret OAuth config the browser needs to initiate the "Sign in with Eliza
 * Cloud" flow (app_id, cloud_url). The app is registered at elizacloud.ai and
 * the `app_id` UUID is stored server-side in ELIZA_APP_ID.
 *
 * Auth resolution order for proxied requests:
 *   1. `x-user-token` — a Privy/Steward JWT obtained via the OAuth redirect flow
 *      (the user signed in with eliza cloud, so their credits are charged).
 *   2. `x-user-api-key` — legacy BYOK path, still supported as a fallback for
 *      users who paste their own `ek_...` key.
 *   3. `ELIZA_API_KEY` server env — owner-paid fallback.
 *
 * Monetization: always forwards `X-Affiliate-Code` (ELIZA_AFFILIATE_CODE, default
 * "edad") so the app owner earns the affiliate markup regardless of which auth
 * method paid.
 */
import type { NextRequest } from "next/server";

const CLOUD_URL = (process.env.ELIZA_CLOUD_URL ?? "https://www.elizacloud.ai").replace(/\/+$/, "");
const UPSTREAM = (process.env.ELIZA_API_BASE ?? `${CLOUD_URL}/api/v1`).replace(/\/+$/, "");
// Only set when explicitly configured — sending an unknown affiliate code
// makes eliza cloud 500 with a raw DB error leak. Leave empty to disable.
const AFFILIATE_CODE = process.env.ELIZA_AFFILIATE_CODE ?? "";
const APP_ID = process.env.ELIZA_APP_ID ?? "";

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: raw } = await ctx.params;
  // Next.js with trailingSlash:true passes an empty final segment — strip it so
  // we don't send "/api/v1/messages/" upstream (eliza cloud 404s on that).
  const segments = raw.filter((s) => s !== "");
  if (!segments.length || segments.some((s) => s.includes(".."))) {
    return jsonError(404, "not_found", "unknown route");
  }

  // Local config endpoint: hands the browser the app_id + cloud URL it needs
  // to build the OAuth authorize URL. Never returns secrets.
  if (segments.length === 1 && segments[0] === "config") {
    return Response.json({
      app_id: APP_ID || null,
      cloud_url: CLOUD_URL,
      affiliate_code: AFFILIATE_CODE,
      server_key_available: false,
    }, { headers: { "cache-control": "no-store" } });
  }

  const userToken = req.headers.get("x-user-token")?.trim();
  const userKey = req.headers.get("x-user-api-key")?.trim();

  const fwd: Record<string, string> = {
    "content-type": req.headers.get("content-type") ?? "application/json",
    "anthropic-version": "2023-06-01",
  };
  if (AFFILIATE_CODE) fwd["x-affiliate-code"] = AFFILIATE_CODE;
  if (APP_ID) fwd["x-app-id"] = APP_ID;

  if (userToken) {
    // OAuth JWT (Privy or Steward) — send as Bearer only, not x-api-key.
    fwd.authorization = `Bearer ${userToken}`;
  } else if (userKey) {
    // BYOK — user-supplied eliza cloud API key.
    fwd.authorization = `Bearer ${userKey}`;
    fwd["x-api-key"] = userKey;
  } else {
    return jsonError(
      401,
      "not_signed_in",
      "dad needs you to sign in with eliza cloud first, champ. hit the sign-in button up top or paste your own key.",
    );
  }

  const target = `${UPSTREAM}/${segments.join("/")}${new URL(req.url).search}`;

  const init: RequestInit = {
    method: req.method,
    headers: fwd,
    cache: "no-store",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  try {
    const res = await fetch(target, init);
    const body = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "application/json";
    return new Response(body, {
      status: res.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store",
      },
    });
  } catch {
    return jsonError(502, "upstream_unreachable", "eliza cloud didn't answer the phone. try again in a sec.");
  }
}

function jsonError(status: number, code: string, message: string) {
  return new Response(
    JSON.stringify({ error: { code, message } }),
    { status, headers: { "content-type": "application/json" } },
  );
}

export const GET = handler;
export const POST = handler;
export const HEAD = handler;
export const OPTIONS = handler;
