# Configure Stripe payments

## Local development

1. Configure the RPC app with the Stripe test account's API key.
2. Start the webhook listener with `pnpm stripe:listen`. It subscribes to the payment events handled by the application and forwards them to
   `http://localhost:4444/webhook/stripe`.
3. Set `LOCAL_STRIPE_WEBHOOK_SECRET` in the RPC app's local configuration to the signing secret printed by the listener.
4. Start the application with `pnpm dev`.

Use the same Stripe test account for checkout creation and the webhook listener. Local development uses
`STRIPE_WEBHOOK_IDENTIFIER=dev`, which skips hosted webhook configuration.

Set `NEXT_PUBLIC_STRIPE_DASHBOARD_URL` in the `monoweb-web` Doppler project. Use the production account's Dashboard
base URL in `prd` and your sandbox's base URL in your personal development config, including its account ID and `/test`
(for example, `https://dashboard.stripe.com/acct_example/test`). The shared `dev` config uses Stripe's generic test
Dashboard. Do not include `/search` or query parameters. The admin page uses this setting for product, payment, and event
search links. Restart development through `pnpm dev` after changes; deployed builds must be rebuilt because this is a
public Next.js build-time setting.

## Hosted webhooks

Configure an existing Stripe webhook endpoint for `${STRIPE_WEBHOOK_HOST}/webhook/stripe` and store its signing secret
in the normal secret store as `STRIPE_WEBHOOK_SECRET`. The endpoint must match the configured URL or have metadata
`identifier` matching `STRIPE_WEBHOOK_IDENTIFIER`.

At startup, the RPC server updates that endpoint's event subscriptions. It retains the endpoint and signing secret
across restarts. Startup fails if the secret is missing or the endpoint cannot be identified uniquely. The subscribed
events are listed in `apps/rpc/src/modules/payment/payment-webhook-service.ts`.

## Deploying the payment ledger migration

1. Stop the old RPC processes and workers before applying `20261108160000_payment_ledger`; the migration replaces
   the attendee payment columns with the payment, attempt, and refund tables.
2. Configure the existing hosted endpoint's `STRIPE_WEBHOOK_SECRET` before starting the updated server.
3. With the intended environment loaded, run `pnpm --filter @dotkomonline/rpc payments:migrate` after the SQL migration.
4. Resolve any errors and rerun the command until it succeeds before starting the updated RPC processes and workers.

The SQL migration copies the existing payment history into the new tables. The one-time command fills in historical
amounts and Stripe identifiers that the old schema did not retain, links imported refunds, and restores capture
scheduling. Stripe requests happen outside database transactions. The command does not issue charges or refunds.

Active or captured attempts without a Stripe identifier, and imported refunds without a unique provider match, need
manual resolution. The command exits with a nonzero status when an attempt cannot be migrated and is safe to rerun.
For an ambiguous refund, set its verified `stripeRefundId` before rerunning the command.
The application expects migrated records and contains no legacy-specific repair paths.

Refunds that previously exempted an attendee from paying again are migrated as an explicit waiver so their existing
registration eligibility is preserved.

## Payment state in the application

`PaymentLedgerService` owns checkout, capture, cancellation, refunds, and reconciliation with Stripe. Its database
access goes through `PaymentRepository`. `AttendancePaymentService` connects those operations to attendee payment
requirements; attendance scheduling and registration remain in `AttendanceService`.

Attendee responses contain a nullable `payment` view, also used by the registration completion response. The view
exposes the current status, amounts in øre, checkout URL, and available actions (`canStartCheckout`, `canCancel`,
`canRefund`, and `canWaive`). Frontends use those actions and `isRequirementSatisfied` instead of inferring eligibility
from timestamps. A refund and a waiver are separate: a refund returns money, while a waiver removes the requirement
to pay. Public attendee summaries omit the payment view.

The payment requirement snapshots the event description and amount when it is created. Later event price changes
do not change existing requirements. Event checkouts share a Stripe product (`event_<eventId>`), created on the first
checkout with the event title, description, and event page URL. The product retains that initial title; checkout prices
come from each payment's saved amount rather than a shared Stripe price. Standalone payments use inline products.

## Finding event payments in Stripe

New Checkout Sessions and PaymentIntents include `event_id`, `event_title`, `event_url`, `attendee_id`, and `user_id`
alongside the payment and attempt IDs. In Stripe Dashboard search, enter `metadata:event_id=<eventId>` and open the
payment results. Check each payment's status: a manual-capture authorization reserves funds but has not charged them yet.
You can bookmark that search for an event overview without filtering by amount or date. See
[Stripe's Dashboard search documentation](https://docs.stripe.com/dashboard/search).

Clicking a checkout item opens the shared event product, with its description and event URL. Existing checkout sessions,
payments, and ad hoc products are not changed retroactively; create a new checkout to see the new product and metadata.
