# Honesty Store API

Uses express to generate an API server, serving static data.

* Format
  * The endpoints are intended to be REST-like but optimised for the minimum number of client requests possible (i.e. the client should only need to make at most 1 request per user action). This API will therefore be tightly coupled to the UI. However, ultimately this API will communicate with other REST APIs on the server-side which will allow loose-coupling of server-side resources.
  * All endpoints respond with JSON in the following structure -
  * `{ response: {} }` - for successful responses (the structure of `response` is message dependent but the top level value must be an object)
  * `{ error: { message: "<errorMessaage>" } }` - for error responses (this structure is fixed)

* Endpoints
  * All endpoints prefixed with `/api/v1/`
  * `/register` - accepts store code, returns union of `refreshToken` and `/session` response (balance, store data and `accessToken`). Web app then subsequently calls `register2` endpoint which requires authentication (via the recently supplied `accessToken`) and also takes email, CC-details and item in initial purchase.
  * `/signin` - accepts email address, console log url (on the server), always responds with 200 response.  App has an `emailToken` (5 minute expiry). `emailToken` is passed to `/signin2`. This responds with a `refreshToken`. 
  * `/session` (authenticated) - returns all data required to render the UI (including balance, x recent transactions, last used store data, card references, etc.)
  * `/topup` (authenticated) - accepts card reference or details of a new card and the topup amount, returns new balance data
  * `/purchase` (authenticated) - accepts item reference, returns new balance and transaction data
  * `/transactions` (authenticated) - accepts paging data and returns next page of transactions
  * `/logout` (authenticated) - expires the `refreshToken` associated with the session
  * `/store` (authenticated) - accepts store code, returns store data for store. Sets last used store to store code.

* Auth
  * All endpoints apart from `/session` require an access token header to authenticate (i.e. `Authorization: Bearer <accessToken>`)
  * The `/session` endpoint requires a refresh token header to authenticate (i.e. `Authorization: Bearer <refreshToken>`) and returns an `accessToken` as part of it's response.
  * The `accessToken` is valid for a period of 5 minutes, the client must re-request from `/session` to retrieve a new token if required. 
    * This mechanism improves the security of the system due to the credentials with the longest lifetime being exposed to the system for the shortest time. 
  * The client must pessimistically expire tokens such that in the normal course of events, a request will never be made with an expired `accessToken`
  * The `refreshToken` should be stored in persistent storage on the client side (i.e. `localStorage`) and will not expire in the normal course of events.
  * Only one `refreshToken` can be issued per account. Previous `refreshToken` will be invalidated and new one takes its place on `signin2`.
