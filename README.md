# honesty-store

## Box Submission

### Shipped Boxes

1) Generate box.txt, consisting of <count> <itemId> <batchId> rows.

This step may involve creating batches and items, if they don't already exist.

2) Run the following, with `BASE_URL`, `SERVICE_TOKEN_SECRET` and `LAMBDA_BASE_URL` in the environment, piping in box.txt:

```
cat box.txt | node scripts/lib/scripts/src/box-submit-hs.js pack <shipping-cost> <store-id> <donation-rate> <dry-run>
```

Note the box-id returned by this script.

3) Run the following, again with `BASE_URL`, `SERVICE_TOKEN_SECRET` and `LAMBDA_BASE_URL` in the environment:

```
node scripts/lib/scripts/src/box-submit-hs.js ship <box-id>
```

### Marketplace Items

1) Add item details in `honesty-store-item` DynamoDB table if they don't already exist. Note: marketplace items are a bit tricky in that each `Item` has a location field. This means that even if adding the exact same Mars bars, for example, as a marketplace item to both 'sl-edn' and 'sl-ncl', you'll need to create a new item so a different location can be assigned.

2) Run the following with `BASE_URL`, `SERVICE_TOKEN_SECRET`, `LAMBDA_BASE_URL` and `TABLE_NAME` where `TABLE_NAME` refers to the batch table you wish to update (normally this would be `honesty-store-batch`):

```
node scripts/lib/scripts/src/box-submit-marketplace.js store-id user-id item-id totalCost count expiry dry-run
```

3) The item will be made immediately available in the store.