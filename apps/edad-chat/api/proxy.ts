/**
 * eDad-chat ↔ eliza cloud proxy.
 *
 * Forwards `/api/*` to ELIZA_API_BASE (default https://www.elizacloud.ai/api/v1).
 *
 * The one special route handled locally is `/api/config`, which returns the
 * non-secret OAuth config the browser needs to initiate the
 * "Sign in with Eliza Cloud" flow (app_id, cloud_url).
 *
 * Auth: every proxied request must carry `x-user-token` (a Steward JWT from
 * the OAuth redirect). There is no operator-paid fallback — usage always
 * lands on the signed-in user's cloud credit balance, which keeps the
 * monetization story honest (creator + affiliate share is a real cut of
 * the user's own credits, not a freebie the operator subsidises).
 *
 * Always forwards `X-Affiliate-Code` (ELIZA_AFFILIATE_CODE) so the app
 * owner earns the affiliate share alongside the creator markup.
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
