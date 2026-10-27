# The Amazon SP-API door

## Token steps

Every call begins with a token trade at Amazon's login endpoint; the door remembers no token between calls.

| Call | The door's own steps before the request |
|---|---|
| Ordinary | Trades the connection's refresh token for an access token. |
| Restricted (`x-cx-restricted-data`) | The same trade, then one call to that origin's `/tokens/2021-03-01/restrictedDataToken` for exactly the request's method and path. |
| Grantless (`x-cx-grantless-scope`) | Trades the client pair for a token of the named scope. The gate still refuses `key_required` unless a connection for that origin's region is saved. |

A step whose failure the door returns — Amazon refused it or handed out no token, or the step returned no status — ends the call as `failed`. A step returns a status when its reply ended or ran past 64 KiB, and none when no reply came, the body broke off, or the runtime refused the reply — a redirect, a 407 or a 421. Where it returned one, the step, its status and Amazon's own words, if a reply that ended within 64 KiB said any, are under the line. A change's line reads `nothing of this PATCH was sent: a call of the Amazon-SP-API adapter's own, made before it, failed`, with the request's own method. A read's line reads `the source answered with a failure` where the step returned a status and `provider_unavailable` where it returned none. A step's reply is kept nowhere.

## Restricted data

The data elements Amazon's Tokens model names are `buyerInfo`, `shippingAddress` and `buyerTaxInformation`. Its `method` values are `GET`, `PUT`, `POST` and `DELETE`; the door sends the request's method as written. Amazon's stated rate for the Tokens API is 1 request a second, burst 10, and each restricted call spends one (`models/tokens-api-model/tokens_2021-03-01.json:33` in <https://github.com/amzn/selling-partner-api-models> at commit `3677bb9d96f4450e6843f1f8207005e925d5c867`).

The Tokens API is the door's own step, and its reply is kept nowhere. A request whose first path segment is `tokens`, in any letter case, is refused `out_of_scope` before a key is read: `the Tokens API is the door's own: a request that needs a restricted-data token names the x-cx-restricted-data header, and the door asks Amazon for the token`. A first path segment that is not plain letters and digits is refused the same way, as every path in Amazon's models begins with one: `a path begins with a slash and a first segment of plain letters and digits, as every path of the Selling Partner API does`.

## Grantless scopes

Amazon's developer page lists three scopes for a client-credentials trade: `sellingpartnerapi::notifications`, `sellingpartnerapi::client_credential:rotation` and `sellingpartnerapi::shipments:track`. After a rotation the new client secret arrives on the developer application's own queue, never in the reply. Rotating the client secret through the door ends every connection until the new secret is saved.

## The request and the reply

- The door composes no `content-type`: a body goes with the headers the request names.
- The door percent-encodes each `--query` name and value, so a value already encoded is encoded twice.
- The door sends its own `user-agent` when the request names none; one the request names goes as written.
- A reply outside 2xx that the door returns lands with its status, its headers and as much of its body as came, and the call ends `failed`, exit 1: the line reads `the source answered HTTP 403`, with the status and the reply's opening under it; a returned `429` is `provider_rate_limit`. A redirect is followed nowhere and nothing of it lands: a read ends `failed`, a change reads `sent, outcome unknown`. `x-amzn-RequestId` and `x-amzn-RateLimit-Limit` are among the receipt's headers.
- A reply cut short ends `failed`, exit 1, whatever its status: the bytes that came land, and the line ends `reply cut short`. Where a 2xx reply broke off, Amazon had answered 2xx: the line reads `the source answered HTTP 200`, with `HTTP 200: the reply broke off after 86 bytes` under it, the status and the count of bytes kept.
- A step or a reply that stalls past the gate's wait is not returned: the call keeps the gate's own ending, in the gate's words, as it does where the door throws. Stalled, a change with no reply begun reads `sent, outcome unknown`, one whose step stalled among them, though that request never left; a read ends `failed`; and a reply whose head arrived ends `failed (provider_unavailable)`, a `429` too: the line is the gate's sentence and then the status, as `HTTP 429`, which `--json` holds as `http_status`.
- A reply and a failure's words land as Amazon wrote them, a token in them included; of a reply's headers, those that carry authority — cookies and authentication challenges — are left out.
- The box keeps an ask's attempt open until it has recorded how it ended: a reply's landing, or an ending with nothing to land. Until then an identical ask is the same attempt: two in flight together are one call to Amazon, and one asked again after a landing that went unrecorded is answered the first reply where the gate kept it, under the same `request_id`, with nothing traded or sent. After that an identical ask is a new call, and a change asked twice is sent twice.
- Amazon's rates are per operation and stated in each model; the door adds no wait, keeps no schedule and retries nothing of its own. A `429` is Amazon's answer that the operation's rate is spent: ask again after a wait, doubling the wait at each `429` from about a second, with a random part of up to half of it added so that two calls waiting together do not ask again together, and stop after five.

## Paths and the seller's own id

A path is one a model's `paths` lists, never a guess: the Sellers API has two, `GET /sellers/v1/marketplaceParticipations` and `GET /sellers/v1/account`, and neither reply carries a seller id (`models/sellers-api-model/sellers.json`). Catalogue items are at `/catalog/2022-04-01/items` and `/catalog/2022-04-01/items/{asin}` (`models/catalog-items-api-model/catalogItems_2022-04-01.json`).

The seller's own id comes from Amazon and is never asked of the seller. Before a path that carries `{sellerId}`, read it once from a fee estimate's reply: `POST /products/fees/v0/items/{Asin}/feesEstimate`, for an ASIN the seller lists, answers it at `payload.FeesEstimateResult.FeesEstimateIdentifier.SellerId` (`models/product-fees-api-model/productFeesV0.json`).

An id in a path is one read from a reply or named by the seller, never one made up. The whole store's orders are read only when the seller asks for them.

## Reports

A report is asked for with `POST /reports/2021-06-30/reports`, its `reportType` and `marketplaceIds` in the body, and read once its `processingStatus` is `DONE` (`models/reports-api-model/reports_2021-06-30.json`). The report types the seller's questions come to:

- `GET_MERCHANT_LISTINGS_ALL_DATA`: the seller's listings. One asked for within the hour of another is answered with the same document, so the reports already made come first: `GET /reports/2021-06-30/reports` with `--query reportTypes=GET_MERCHANT_LISTINGS_ALL_DATA`.
- `GET_SALES_AND_TRAFFIC_REPORT`: sales and traffic.
- `GET_BRAND_ANALYTICS_SEARCH_QUERY_PERFORMANCE_REPORT`, the Search Query Performance (SQP) report: `reportOptions.asin` names the ASINs and `reportOptions.reportPeriod` is `WEEK`, `MONTH` or `QUARTER`; `DAY` and `YEAR` end the report `FATAL`. SQP reports run one at a time, about 35 minutes for a week not asked for before, so the next is asked for once the last is `DONE`.

## The seller's application

The developer application behind the client pair needs three roles: Product Listing, Pricing and Brand Analytics. Amazon refuses a path outside the application's roles.

The door has no sandbox default and no write switch: a call goes to the origin it names, production or sandbox, and a change is sent as a read is.

## Document URLs

Amazon's models state the lifetime beside each URL: `reports_2021-06-30.json` (`ReportDocument.url`) and `feeds_2021-06-30.json` (`FeedDocument.url`, and the upload `url` of `CreateFeedDocumentResponse`) each say "This URL expires after 5 minutes." A URL from another API carries the lifetime its own model states.
