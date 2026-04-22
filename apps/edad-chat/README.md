# eDad Chat — the dad you never had (chat-in-place variant)

A different pattern from `apps/edad/`: instead of creating a character on Eliza Cloud and redirecting users to `cloud/chat/<characterId>`, this variant **keeps the chat UI on the app's own domain** and proxies `/v1/messages` calls to Eliza Cloud with the affiliate code attached as a header.

Shipped live at **https://milady.nubs.site/apps/edad/** by RemilioNubilio.

## Why this pattern exists

- Keeps users on the miniapp's domain end-to-end (branding, UX continuity, embeddable elsewhere)
- Users chat with their own Eliza Cloud credits (OAuth or BYOK), so no "buy app credits first" friction
- Affiliate markup earned per call via `X-Affiliate-Code` header → lands in creator's redeemable earnings balance on every reply
- No character registration, no anonymous session management — lean proxy + minimal frontend

## How it works

```
browser                                app backend                       eliza cloud
┌──────────────────┐                  ┌──────────────────┐              ┌───────────────────┐
│ index.html       │  POST /api/msgs  │ proxy.ts         │  /v1/messages │ billing + LLM    │
│ + chat UI JS     │─────────────────▶│ adds x-app-id    │──────────────▶│ adds markup → me │
│                  │                  │ + x-affiliate-   │              │ credits redeemable│
│ user JWT or BYOK │                  │   code header    │              │ earnings balance │
└──────────────────┘                  └──────────────────┘              └───────────────────┘
```

## Files

| file | purpose |
|---|---|
| `public/index.html` | landing + chat UI + OAuth sign-in / BYOK fallback + streaming message loop |
| `public/style.css` | dad-energy dark theme, SVG silhouette, responsive |
| `public/meta.json` | app index metadata |
| `api/proxy.ts` | Next.js-style catch-all route handler; accepts `x-user-token` (OAuth) or `x-user-api-key` (BYOK); forwards to `ELIZA_CLOUD_URL/api/v1/messages` with `X-App-Id` and `X-Affiliate-Code` headers |

## Env required

```bash
ELIZA_APP_ID=<uuid of app registered via POST /api/v1/apps>
ELIZA_CLOUD_URL=https://www.elizacloud.ai
ELIZA_AFFILIATE_CODE=AFF-XXXXXX     # your affiliate code — drives per-call markup earnings
# ELIZA_API_KEY deliberately omitted: the proxy rejects unauth'd requests with 401
#   so users must sign in with their own eliza cloud account or BYOK their own key,
#   and no app-owner credits ever get burned by freeloaders.
```

## Architectural trade-offs vs `apps/edad/` (character creator variant)

| concern | `edad/` (this repo's existing variant) | `edad-chat/` (this variant) |
|---|---|---|
| where chat happens | Eliza Cloud domain (`/chat/<charId>`) | miniapp's own domain |
| character per user | yes (registered via `/api/affiliate/create-character`) | no — system prompt is per-request |
| cold-start friction | low (anon session + 5 free messages via affiliate API) | medium (OAuth sign-in or BYOK required) |
| monetization lever | affiliate API `affiliateId` baked into character creation | `X-Affiliate-Code` header on every `/v1/messages` |
| works for existing users | yes (redirects them into cloud chat) | yes (they chat right there with their credits) |
| brand continuity | breaks (user leaves miniapp domain) | preserved |

Neither is strictly better — they serve different distribution models. `edad/` wins for signup-funnel miniapps; `edad-chat/` wins for embedded chat on a branded domain.

## Deploy checklist

1. Register app via `POST https://www.elizacloud.ai/api/v1/apps` with `{ name, app_url, skipGitHubRepo: true }` → get `app_id` back
2. Go to https://www.elizacloud.ai/dashboard/affiliates → create affiliate code, set markup %
3. Set `ELIZA_APP_ID` and `ELIZA_AFFILIATE_CODE` env vars on the host
4. Serve `public/` as static assets; wire `api/proxy.ts` as a server route at `/api/*`
5. Users hit your site → sign in with Eliza Cloud → chat → you earn markup per call

## License / attribution

Built by [RemilioNubilio](https://github.com/RemilioNubilio). Inspired by Shaw's original eDad spec in `apps/edad/`.
