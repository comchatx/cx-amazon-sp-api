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
- Amazon's rates are per operation and stated in each model; the door adds no wait, keeps no schedule and retries nothing of its own. Amazon rates each operation by a token bucket for each seller and application, and the rate a seller is given can be above the model's. A `429` is Amazon's answer that the operation's rate is spent; Amazon calls it retry-able, says repeated throttled requests need a back-off, and that a few transient `429`s happen whatever the caller does. Amazon's pages state no `Retry-After` header. `x-amzn-RateLimit-Limit`, when present, is the rate applied to the operation; Amazon sends it on 2xx, 400 and 404 replies and says not to depend on it being there (Usage Plans and Rate Limits).

## Paths and the seller's own id

A path is one a model's `paths` lists, never a guess: the Sellers API has two, `GET /sellers/v1/marketplaceParticipations` and `GET /sellers/v1/account`, and neither reply carries a seller id (`models/sellers-api-model/sellers.json`). Catalogue items are at `/catalog/2022-04-01/items` and `/catalog/2022-04-01/items/{asin}` (`models/catalog-items-api-model/catalogItems_2022-04-01.json`).

The seller's own id comes from Amazon and is never asked of the seller. Before a path that carries `{sellerId}`, read it once from a fee estimate's reply: `POST /products/fees/v0/items/{Asin}/feesEstimate`, for an ASIN the seller lists, answers it at `payload.FeesEstimateResult.FeesEstimateIdentifier.SellerId` (`models/product-fees-api-model/productFeesV0.json`).

An id in a path is one read from a reply or named by the seller, never one made up.

`getPricing`, `GET /products/pricing/v0/price`, requires `MarketplaceId` and `ItemType`, `Asin` or `Sku`, with up to twenty `Asins` or `Skus` to match (`models/product-pricing-api-model/productPricingV0.json`). Its model documents a `400` for missing or invalid parameters, yet a query with `ItemType` left out or naming another value was answered `404` `NotFound`, "The requested resource doesn't exist.", on a live store on 2026-10-14: that 404 says the query was written wrong, not that the item is missing.

## Reports

The Reports API's own facts (`models/reports-api-model/reports_2021-06-30.json`; Amazon's Reports API guide):

- `createReport`, `POST /reports/2021-06-30/reports`, takes `reportType` and `marketplaceIds`, both required, and `dataStartTime`, `dataEndTime` and `reportOptions` where the type uses them; it answers a `reportId`. Rate 0.0167 a second, burst 15.
- `getReport`, `GET /reports/2021-06-30/reports/{reportId}`, answers its `processingStatus`. `IN_QUEUE` and `IN_PROGRESS` have not ended. `DONE` carries a `reportDocumentId`. `FATAL` might carry one, whose document says why the report stopped. `CANCELLED` is a report cancelled before it started, or one Amazon cancelled because it had no data. Rate 2 a second, burst 15.
- `getReportDocument`, `GET /reports/2021-06-30/documents/{reportDocumentId}`, answers the document's `url` and, where the contents are compressed, `compressionAlgorithm`, `GZIP`. Rate 0.0167 a second, burst 15.
- `getReports`, `GET /reports/2021-06-30/reports`, lists reports already made; it takes `reportTypes` or a `nextToken`. Rate 0.0222 a second, burst 10. `cancelReport` cancels a report still `IN_QUEUE`.
- A report is kept at most 90 days, and `getReport` serves only those created within the last 90 days. A document URL expires after 5 minutes (below).
- Settlement reports cannot be requested or scheduled: Amazon schedules them, and `getReports` finds them. `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_V2` is the settlement report that stays, role Finance and Accounting; `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE` and `GET_V2_SETTLEMENT_REPORT_DATA_XML` are removed on 2026-11-11 (Settlement Reports; SP-API Deprecation Schedule).

The report types the seller's questions come to:

- `GET_MERCHANT_LISTINGS_ALL_DATA`: the seller's listings. One asked for within the hour of another is answered with the same document, so the reports already made come first: `GET /reports/2021-06-30/reports` with `--query reportTypes=GET_MERCHANT_LISTINGS_ALL_DATA`.
- `GET_SALES_AND_TRAFFIC_REPORT`: sales and traffic.
- `GET_BRAND_ANALYTICS_SEARCH_QUERY_PERFORMANCE_REPORT`, the Search Query Performance (SQP) report: `reportOptions.asin` names the ASINs and `reportOptions.reportPeriod` is `WEEK`, `MONTH` or `QUARTER`; `DAY` and `YEAR` end the report `FATAL`. SQP reports run one at a time, about 35 minutes for a week not asked for before, so the next is asked for once the last is `DONE`.

## Data Kiosk

Data Kiosk's own facts (`models/data-kiosk-api-model/dataKiosk_2023-11-15.json`; Amazon's Data Kiosk API guide):

- `createQuery`, `POST /dataKiosk/2023-11-15/queries`, takes a GraphQL query as a string, at most 8,000 characters once unnecessary whitespace is removed. Rate 0.0167 a second, burst 15.
- Data Kiosk allows one request per query, seller and application: a `createQuery` while the same one is pending fails. It schedules no query and keeps no backlog.
- `getQuery`, `GET /dataKiosk/2023-11-15/queries/{queryId}`, answers the `processingStatus`, with the Reports API's five values. `DONE` carries a `dataDocumentId`, a JSONL document; `FATAL` carries an `errorDocumentId`, a JSON one; `DONE` with neither is a query that found no data. Rate 2 a second, burst 15.
- `getDocument`, `GET /dataKiosk/2023-11-15/documents/{documentId}`, answers a URL that expires in five minutes. Rate 0.0167 a second, burst 15.
- How long a query and its documents are kept is the shortest `@resultRetention` among the fields it asks for.
- Each field requires a role, checked when the query is created; Amazon's Data Kiosk guide lists Brand Analytics for each dataset.

## The seller's application

The developer application behind the client pair needs five roles: Product Listing, Pricing, Brand Analytics, Finance and Accounting, and Amazon Fulfillment.

- Finance and Accounting is the one role Amazon's Role Mappings for SP-API Operations names for the Finances API's `listTransactions`.
- Amazon Fulfillment, of the five, is the one that page names for the Fulfillment Inbound API (v2024-03-20 and v0), the FBA Inbound Eligibility API and the Fulfillment Outbound API (Multi-Channel Fulfillment). Amazon's Role Mappings for SP-API Types names it, of the five, for the report types `GET_LEDGER_DETAIL_VIEW_DATA`, `GET_LEDGER_SUMMARY_VIEW_DATA`, `GET_FBA_INVENTORY_PLANNING_DATA`, `GET_AFN_INVENTORY_DATA`, `GET_FBA_OVERAGE_FEE_CHARGES_DATA`, `GET_FBA_FULFILLMENT_CUSTOMER_SHIPMENT_SALES_DATA` and `GET_SELLER_FEEDBACK_DATA`, the removal feed `POST_FLAT_FILE_FBA_CREATE_REMOVAL` and the `FBA_INVENTORY_AVAILABILITY_CHANGES` notification.

Amazon refuses a path outside the application's roles with a `403`. A role added to the application reaches a store only once the store authorises the application again, which gives a new refresh token (Selling Partner API Roles).

The door has no sandbox default and no write switch: a call goes to the origin it names, production or sandbox, and a change is sent as a read is.

## Document URLs

Amazon's models state the lifetime beside each URL: `reports_2021-06-30.json` (`ReportDocument.url`) and `feeds_2021-06-30.json` (`FeedDocument.url`, and the upload `url` of `CreateFeedDocumentResponse`) each say "This URL expires after 5 minutes." A URL from another API carries the lifetime its own model states.
