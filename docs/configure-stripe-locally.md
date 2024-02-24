# How to configure stripe locally

If you want the payment system to work while running monoweb locally, you will have to follow these steps:

1. Navigate to [this link](https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local) and follow
   instruction (1) on the page
2. Follow instruction (2) on the page BUT replace the url in the command
   with `localhost:3000/api/webhooks/stripe/{public_key}` where {public_key} is your stripe public key
3. Replace the appropriate webhook secret env variable in .env with the one given by the CLI in the console
4. Start monoweb with `pnpm dev`
5. Follow step(3) on the page. This will finish registering your local system as a webhook receipient
6. Finally, when all steps are finished, click "done"

If you have multiple stripe accounts configured like monoweb has right now, you might want to do this on every account.
If not then just make sure that you are using the configured stripe account when you are creating checkout sessions.

That should be it :)
