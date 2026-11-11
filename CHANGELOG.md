# Changelog

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
