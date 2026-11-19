# Changelog

## 0.1.15

- The README's first paragraph, in Chinese, is the one signed on 2026-11-18 (「把你的亚马逊店铺连到 cx，……覆盖你在北美、欧洲和远东授权的站点。」), and in English the paragraph of the same meaning ("Connect your Amazon store to cx … in the regions you authorise.").
- The README's "What it needs" section leaves, in both languages, heading and all, as signed on 2026-11-18. The Plugins page draws what installs with it.
- `comchatx.builds` names `cx-amazon-seller` as optional, with the reason signed on 2026-11-18: "Tells cx from the start that you sell on Amazon." / 「用于让 cx 从第一条消息起就知道你在亚马逊开店。」
- The skill's line is the one signed on 2026-11-17, in `comchatx.skills.amazon-sp-api` as `zh` 「读取和修改你的亚马逊店铺：订单、listing、库存和财务。」 and `en` "Reads and changes your Amazon store: orders, listings, stock and finances.". `SKILL.md`'s `description` is unchanged.
- The templates read the lines signed on 2026-11-17: `listing-check` "Check [SKU]'s listing for the issues Amazon flags, and propose fixes" / 「检查【SKU】这条 listing 上亚马逊标出的问题，并给出修复方案」; `low-stock`'s Chinese writes listing in lower case, 「找出两周内会断货的 FBA listing」; `orders-today`'s English is "See today's orders in my store, marketplace by marketplace".

## 0.1.14

- The card's name is the one signed on 2026-11-17: "Amazon SP-API" on the English page (`comchatx.name`) and 「亚马逊卖家接口」 on the Chinese page (`comchatx.nameZh`).
- The README names each other plugin it speaks of by the card's name in its own language, a link to that plugin's page on npm, never by the npm name.

## 0.1.13

- `comchatx.source.lines` holds four more of the page's words for the store list, in English and Chinese, signed on 2026-11-13: the line when Amazon's check finds no store for a token, "Store connected." once a store passes, the line under a store whose refresh token Amazon no longer accepts, and the line under a store for which Amazon listed no marketplace. The page prints no line of its own in those places.

## 0.1.12

- `comchatx.source.lines` holds five more of the page's words for the store list, in English and Chinese: the heading of the first form, "Connect your store", the line under it on what cx can do once connected, the list's heading, "Stores", "Checking with Amazon…" while Amazon is asked, and "Sells in {places}" under a store, `{places}` the countries it sells in. They are the platform's signed words for those places, moved as they are.
- `comchatx.source.regions` names Amazon's three regions, North America, Europe and Far East, in English and Chinese, as the page names them.

## 0.1.11

- `comchatx.source.fields.<field>.label` names each field in English and Chinese, as the account's page draws it: "Client identifier", "Client secret" and "Refresh token". The page used the field's own key.
- `comchatx.source.lines` holds the page's words for the store list, in English and Chinese: the add button, "Add a store", and the line saying a removed refresh token takes its stores with it. They are the words of the signed prototype.

## 0.1.10

- The door's reference names a fifth role for the developer application, Amazon Fulfillment, and what Amazon's Role Mappings say it opens: the Fulfillment Inbound, FBA Inbound Eligibility and Fulfillment Outbound APIs, and the inventory ledger, inventory planning, AFN inventory, overage fee, customer shipment sales and seller feedback reports. A role added to the application reaches a store once the store authorises it again.
- The skill's example reads orders with the Orders API's `searchOrders` (2026-01-01), rated 0.0056 a second, burst 20; the Orders v0 reads it used are removed on 2027-03-27.
- The door's reference states the Reports API's lifecycle (create, status, document, list), how long a report and its document URL stay, that settlement reports cannot be requested and the two older settlement reports go on 2026-11-11, and Data Kiosk's query limits.
- A `429` is stated as Amazon states it, with no wait of the skill's own; `getPricing`'s required parameters and its `404` to a query written wrong are stated.
- The door's reference says what Amazon qualifies: most operations, not grantless ones, are rated for each seller and application; the Economics dataset needs Selling Partner Insights, as Amazon corrected; and Product Listing opens the Fulfillment Outbound API's `cancelFulfillmentOrder` too.
- The sentence that limited reading the whole store's orders to when the seller asks is gone, as ComChatX's decision D233 rules.

## 0.1.9

- The card's line and the Overview, in English and Chinese, are the words signed on 2026-11-10: "Checks orders, stock and fees, and edits listings and prices." as npm's `description`, and 「查订单、库存和费用，替你改 listing 和价格。」 as `comchatx.about`. They said "Reads and updates your own Amazon store." and 「读取并更新你自己的亚马逊店铺。」.
- `DEVELOPING.md` holds the install line, `pi install npm:cx-amazon-sp-api`.

## 0.1.8

- The card's Chinese line is `comchatx.about`, the field the Plugins page reads, in place of `comchatx.description.zh`. Its words are unchanged.

## 0.1.7

- cx judges when to ask you before it changes a listing, as ComChatX's decision D233 rules. The listing-check template still asks for the change that would fix each issue, and no longer ends on "Make no change until I confirm which ones to make."
- The door's reference names a fourth role for the developer application, Finance and Accounting: Amazon's Role Mappings for SP-API Operations names it as the one role for the Finances API's `listTransactions`, which cx reads for your finances.
