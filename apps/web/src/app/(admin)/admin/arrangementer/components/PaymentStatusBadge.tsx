import type { PaymentView } from "@dotkomonline/rpc/payment"
import { Badge, type BadgeColor } from "@dotkomonline/ui"

const PAYMENT_STATUS_BADGE: Record<PaymentView["status"], { color: BadgeColor; children: string }> = {
  UNPAID: { color: "red", children: "Ikke betalt" },
  PROCESSING: { color: "blue", children: "Behandles" },
  AUTHORIZED: { color: "blue", children: "Reservert" },
  PAID: { color: "green", children: "Betalt" },
  PARTIALLY_REFUNDED: { color: "gray", children: "Delvis refundert" },
  REFUND_PENDING: { color: "blue", children: "Refusjon behandles" },
  REFUNDED: { color: "gray", children: "Refundert" },
  CANCELLED: { color: "gray", children: "Kansellert" },
  EXPIRED: { color: "gray", children: "Utløpt" },
  FAILED: { color: "red", children: "Mislyktes" },
  WAIVED: { color: "gray", children: "Fritatt" },
}

interface PaymentStatusBadgeProps {
  payment: PaymentView | null
}

export function PaymentStatusBadge({ payment }: PaymentStatusBadgeProps) {
  const badge =
    payment === null ? { color: "gray" as const, children: "Ingen betaling" } : PAYMENT_STATUS_BADGE[payment.status]

  return <Badge color={badge.color}>{badge.children}</Badge>
}
