import { pathToFileURL } from "node:url"
import type { DBClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import { fromUnixTime } from "date-fns"
import type Stripe from "stripe"
import { getStripeResourceId } from "../modules/payment/stripe-payment"
import { createConfiguration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

export async function migratePaymentAttempt(prisma: DBClient, stripe: Stripe, attemptId: string): Promise<void> {
  const attempt = await prisma.paymentAttempt.findUniqueOrThrow({
    where: {
      id: attemptId,
    },
    include: {
      refunds: true,
    },
  })

  if (attempt.stripeCheckoutSessionId === null && attempt.stripePaymentIntentId === null) {
    if (attempt.status !== "CANCELLED") {
      throw new Error(`PaymentAttempt(ID=${attemptId}) needs a Stripe identifier before it can be migrated`)
    }

    return
  }

  const session =
    attempt.stripeCheckoutSessionId === null
      ? null
      : await stripe.checkout.sessions.retrieve(attempt.stripeCheckoutSessionId)
  const paymentIntentId = getStripeResourceId(session?.payment_intent) ?? attempt.stripePaymentIntentId
  const paymentIntent = paymentIntentId === null ? null : await stripe.paymentIntents.retrieve(paymentIntentId)
  const amountOre = session?.amount_total ?? paymentIntent?.amount
  const currency = session?.currency ?? paymentIntent?.currency

  if (amountOre == null || currency !== "nok") {
    throw new Error(`PaymentAttempt(ID=${attemptId}) does not have a NOK amount in Stripe`)
  }

  const importedRefund = attempt.refunds.find((refund) => {
    return refund.id === `${attempt.paymentId}:legacy-refund` && refund.stripeRefundId === null
  })
  const refunds: Stripe.Refund[] = []

  if (importedRefund !== undefined && paymentIntentId !== null) {
    for await (const refund of stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
    })) {
      refunds.push(refund)
    }
  }

  // The old schema retained one refund actor, but no provider refund ID. Ambiguous matches need manual resolution.
  if (importedRefund !== undefined && refunds.length !== 1) {
    throw new Error(`PaymentAttempt(ID=${attemptId}) has an imported refund that cannot be matched uniquely in Stripe`)
  }

  await prisma.$transaction(async (handle) => {
    await handle.payment.update({
      where: {
        id: attempt.paymentId,
      },
      data: {
        amountOre,
      },
    })
    await handle.paymentAttempt.update({
      where: {
        id: attemptId,
      },
      data: {
        stripePaymentIntentId: paymentIntentId,
      },
    })

    if (importedRefund !== undefined) {
      const refund = refunds[0]

      await handle.paymentRefund.update({
        where: {
          id: importedRefund.id,
        },
        data: {
          stripeRefundId: refund.id,
          amountOre: refund.amount,
          reason: refund.reason,
          createdAt: fromUnixTime(refund.created),
        },
      })
    }
  })
}

async function main(): Promise<void> {
  const configuration = createConfiguration()
  const logger = getLogger("migrate-payments")
  const clients = createThirdPartyClients(configuration)
  const { prisma, paymentLedgerService, attendanceService } = await createServiceLayer(clients, configuration)

  try {
    const attempts = await prisma.paymentAttempt.findMany({
      where: {
        id: {
          endsWith: ":legacy",
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        id: "asc",
      },
    })

    for (const attempt of attempts) {
      try {
        await migratePaymentAttempt(prisma, clients.stripe, attempt.id)

        const payment = await paymentLedgerService.syncAttempt(prisma, attempt.id)

        if (payment.attendeeId !== null) {
          await attendanceService.syncAttendeePayment(prisma, payment.attendeeId)
        }

        logger.info("Migrated PaymentAttempt(ID=%s)", attempt.id)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        logger.error("Could not migrate PaymentAttempt(ID=%s): %s", attempt.id, message)
        process.exitCode = 1
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

const scriptPath = process.argv[1]
const isMain = scriptPath !== undefined && import.meta.url === pathToFileURL(scriptPath).href

if (isMain) {
  await main()
}
