---
name: amazon-sp-api
description: The seller's own Amazon selling account through Amazon's Selling Partner API (SP-API) — orders, listings, inventory, reports, feeds, finances and every other operation Amazon's reference lists, read and write, in each region the seller authorised. Use before the first call that reads or changes the seller's own Amazon account. Needs cx-sources; if no cx-sources skill is listed, it is not installed, and the seller installs it in Plugins.
---

Amazon SP-API is an open door through `cx raw`; read cx-sources first. The door carries any method, path, query, header and body to the origin the request names, attaches the seller's token, and lands Amazon's reply as Amazon gave it, at no charge. If Amazon SP-API is off, the seller turns its plugin on in Plugins.

```sh
cx raw amazon-sp-api --origin https://sellingpartnerapi-na.amazon.com --method GET --path /orders/v0/orders --query MarketplaceIds=ATVPDKIKX0DER --query CreatedAfter=2026-10-01T00:00:00Z
```

Amazon's reference: <https://developer-docs.amazon.com/sp-api>, models at <https://github.com/amzn/selling-partner-api-models>.

## Origins and connections

| Production | Sandbox | Region |
|---|---|---|
| `https://sellingpartnerapi-na.amazon.com` | `https://sandbox.sellingpartnerapi-na.amazon.com` | `na` |
| `https://sellingpartnerapi-eu.amazon.com` | `https://sandbox.sellingpartnerapi-eu.amazon.com` | `eu` |
| `https://sellingpartnerapi-fe.amazon.com` | `https://sandbox.sellingpartnerapi-fe.amazon.com` | `fe` |

The platform holds the client pair, `client_id` and `client_secret`, and the seller's connections, each a store, its region and its `refresh_token`; the box holds none. A call goes on its origin region's connection; where the region holds several, `--header x-cx-store=<store>` names one, and Amazon never sees it. Without the client pair or that connection, the door refuses `key_required`, naming what is missing, before anything is sent. A request naming `x-amz-access-token` is refused.

## Two headers

- `--header x-cx-restricted-data=<data elements>`: the door gets a restricted-data token for exactly this method and path and sends the call on it; the value is Amazon's data elements, comma-separated, or empty.
- `--header x-cx-grantless-scope=<scope>`: the door sends a grantless call on a token of that scope, Amazon's own string.

A request names at most one; neither reaches Amazon. The Tokens API is the door's own: a `/tokens` path is refused.

## The door

- The door holds no seller id; listing paths carry one, read from a fee estimate's reply.
- A `429` is Amazon's answer: the door adds no wait.
- A `GET` or `HEAD` with a body, `TRACE`, `CONNECT` and `TRACK` are not sent; a path segment `.` or `..` is refused, as is a character outside URL path characters and `%XX` escapes.
- A document URL in a reply is the box's own download or upload; Amazon keeps a report or feed document URL alive for 5 minutes.

Token steps, rates, reports, roles, scopes and failures: [references/door.md](references/door.md).
