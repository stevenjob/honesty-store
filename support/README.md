Steps to transfer scottcoin funds to honesty.store
--------------------------------------------------

1) Open [spreadsheet][]

2) Find user

3) Copy mnemonic (column C)

4) In copay:

4a) Click 'Add Wallet'

4b) Click 'Import'

4c) Paste mnemonic

4d) Click 'Advanced'

4e) Set wallet service url: https://scottcoin.chrisprice.io/bws/api

4f) Click 'Import'

4g) Select newly imported wallet

4h) Click 'Send' in tab bar

4i) Set recipient: 1111111111111111111114oLvT2

4j) Click '...' (more) button then 'Send Max'

4k) Send

5) Run script in root of `honesty-store` repo:

5a) Replace `<master-service-secret>` `<scottcoins-rounded-up-to-pence>` `<userId>` and `<scottcoin-block-hash>` in the below command, and run it:
```
SERVICE_TOKEN_SECRET=service:<master-service-secret> BASE_URL=https://honesty.store node support/lib/support/src/custom-topup.js <userId> <scottcoins-rounded-up-to-pence> '{ "scottcoinTx": "<scottcoin-block-hash>" }'
```

5b) Save the returned transaction Id in the [spreadsheet][], column D.


[spreadsheet]: https://docs.google.com/spreadsheets/d/1zsTH8pDdCEdX92C-yZcoSo5T52hRKR2NlBg4LUDPxKw/edit?ts=58344830#gid=0
