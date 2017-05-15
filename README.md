# honesty-store

## Box Submission

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
