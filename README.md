# galactic-thunderdome-x

https://owdocs.vercel.app

<a href="https://vercel.com?utm_source=[team-name]&utm_campaign=oss" width="150" height="30">
    <img src="https://images.ctfassets.net/e5382hct74si/78Olo8EZRdUlcDUFQvnzG7/fa4cdb6dc04c40fceac194134788a0e2/1618983297-powered-by-vercel.svg" alt="Vercel">
</a>

## Development

1. `pnpm i` to install packages
2. `pnpm build` to build packages
3. `docker-compose up` to start databases
4. The command will output a client id, set this in apps/web/.env. Copy the example from .env.example
5. `pnpm dev` to run the project
   - You can run `pnpm dev --filter=<project>` to run a certain project from root, such as `pnpm dev --filter=web`

## Environment
You need to set up environment variables for the project to work. You can get them on [doppler.com](https://doppler.com), or using the cli:

```sh
doppler run -- pnpm dev
```

### [Payment] How to configure stripe (locally)

If you want the payment system to work while running monoweb locally, you will have to follow these steps:

1. Navigate to [this link](https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local) and follow instruction (1) on the page
2. Follow instruction (2) on the page BUT replace the url in the command with `localhost:3000/api/webhooks/stripe/{public_key}` where {public_key} is your stripe public key
3. Replace the appropriate webhook secret env variable in .env with the one given by the CLI in the console
4. Start monoweb with `pnpm dev`
5. Follow step(3) on the page. This will finish registering your local system as a webhook receipient
6. Finally, when all steps are finished, click "done"

If you have multiple stripe accounts configured like monoweb has right now, you might want to do this on every account. If not then just make sure that you are using the configured stripe account when you are creating checkout sessions.

That should be it :)
