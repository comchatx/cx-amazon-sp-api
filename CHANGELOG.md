# Changelog

## 0.1.9

- The card's line and the Overview, in English and Chinese, are the words signed on 2026-11-10: "Checks orders, stock and fees, and edits listings and prices." as npm's `description`, and 「查订单、库存和费用，替你改 listing 和价格。」 as `comchatx.about`. They said "Reads and updates your own Amazon store." and 「读取并更新你自己的亚马逊店铺。」.
- `DEVELOPING.md` holds the install line, `pi install npm:cx-amazon-sp-api`.

## 0.1.8

- The card's Chinese line is `comchatx.about`, the field the Plugins page reads, in place of `comchatx.description.zh`. Its words are unchanged.

## 0.1.7

- cx judges when to ask you before it changes a listing, as ComChatX's decision D233 rules. The listing-check template still asks for the change that would fix each issue, and no longer ends on "Make no change until I confirm which ones to make."
- The door's reference names a fourth role for the developer application, Finance and Accounting: Amazon's Role Mappings for SP-API Operations names it as the one role for the Finances API's `listTransactions`, which cx reads for your finances.
