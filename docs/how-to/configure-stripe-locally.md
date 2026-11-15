# Configure Stripe payments

## Local development

1. Configure the RPC app with the Stripe test account's API key.
2. Start the webhook listener with `pnpm stripe:listen`. It subscribes to the payment events handled by the application and forwards them to
   `http://localhost:4444/webhook/stripe`.
3. Set `LOCAL_STRIPE_WEBHOOK_SECRET` in the RPC app's local configuration to the signing secret printed by the listener.
4. Start the application with `pnpm dev`.

Use the same Stripe test account for checkout creation and the webhook listener. Local development uses
`STRIPE_WEBHOOK_IDENTIFIER=dev`, which skips hosted webhook configuration.

## Hosted webhooks

Configure an existing Stripe webhook endpoint for `${STRIPE_WEBHOOK_HOST}/webhook/stripe` and store its signing secret
in the normal secret store as `STRIPE_WEBHOOK_SECRET`. The endpoint must match the configured URL or have metadata
`identifier` matching `STRIPE_WEBHOOK_IDENTIFIER`.

At startup, the RPC server updates that endpoint's event subscriptions. It retains the endpoint and signing secret
across restarts. Startup fails if the secret is missing or the endpoint cannot be identified uniquely. The subscribed
events are listed in `apps/rpc/src/modules/payment/payment-webhook-service.ts`.

## Payment state in the application

`PaymentLedgerService` owns checkout, capture, cancellation, refunds, and reconciliation with Stripe. Its database
access goes through `PaymentRepository`. `AttendancePaymentService` connects those operations to attendee payment
requirements; attendance scheduling and registration remain in `AttendanceService`.

`PaymentWorkflowService` delivers payment changes to the application handler configured in `core.ts`. Webhooks and
checkout jobs identify payment attempts, without requiring attendance IDs. The current handler synchronizes attendance
when a payment has an attendee; other payment uses can add their own handling there.

Checkout preparation commits the attempt, request inputs, and an `OPEN_PAYMENT_CHECKOUT` task before contacting Stripe.
Creation and cleanup retries use the same attempt ID and idempotency key. Checkout jobs have a five-minute processing
lease; abandoned executions are reclaimed, and an old worker cannot acknowledge a newer worker's claim. Application
handlers must tolerate repeated delivery.

Attendance owns the payment deadline. Checkout recovery broadcasts the payment link immediately and leaves the
original deadline unchanged. If checkout never became available, an overdue reservation is released without
missing-payment penalties.

Attendee responses contain a nullable `payment` view, also used by the registration completion response. The view
exposes the current status, amounts in øre, checkout URL, and available actions (`canStartCheckout`, `canCancel`,
`canRefund`, and `canWaive`). Frontends use those actions and `isRequirementSatisfied` instead of inferring eligibility
from timestamps. A refund and a waiver are separate: a refund returns money, while a waiver removes the requirement
to pay. Public attendee summaries omit the payment view.

The payment requirement snapshots the event description and amount when it is created. Later event price changes
do not change existing requirements. Checkout uses that snapshot directly; it does not maintain separate event
products and prices in Stripe. Its return URL is built from the configured web origin and event page.
