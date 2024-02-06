import { randomUUID } from "crypto"
import { type RefundRequest } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { describe, vi } from "vitest"
import { paymentPayload } from "./payment-service.spec"
import { productPayload } from "./product-service.spec"
import { RefundRequestRepositoryImpl } from "../refund-request-repository"
import { ProductRepositoryImpl } from "../product-repository"
import { RefundRequestServiceImpl } from "../refund-request-service"
import { PaymentRepositoryImpl } from "../payment-repository"
import { PaymentServiceImpl } from "../payment-service"
import { EventRepositoryImpl } from "../../event/event-repository"

export const refundRequestPayload: Omit<RefundRequest, "id"> = {
  createdAt: new Date(2022, 1, 1),
  updatedAt: new Date(2022, 1, 1),
  paymentId: randomUUID(),
  userId: randomUUID(),
  reason: "I want my money back",
  status: "PENDING",
  handledBy: null,
}

describe("RefundRequestService", () => {
  const db = vi.mocked(Kysely.prototype)
  const refundRequestRepository = new RefundRequestRepositoryImpl(db)
  const paymentRepository = new PaymentRepositoryImpl(db)
  const productRepository = new ProductRepositoryImpl(db)
  const eventRepository = new EventRepositoryImpl(db)
  const paymentService = new PaymentServiceImpl(
    paymentRepository,
    productRepository,
    eventRepository,
    refundRequestRepository
  )
  const refundRequestService = new RefundRequestServiceImpl(
    refundRequestRepository,
    paymentRepository,
    productRepository,
    paymentService
  )

  const paymentPayloadExtended = {
    ...paymentPayload,
    id: randomUUID(),
  }

  const productPayloadExtended = {
    ...productPayload,
    id: randomUUID(),
  }

  const refundRequestPayloadExtended = {
    ...refundRequestPayload,
    id: randomUUID(),
  }

  const userId = randomUUID()

  it("fails to create refund request for non-refundable payment", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce(paymentPayloadExtended)
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({ ...productPayloadExtended, isRefundable: false })

    const call = refundRequestService.createRefundRequest(paymentPayloadExtended.id, userId, "Test reason")
    await expect(call).rejects.toThrowError("Payment is not refundable")
  })

  it("fails to create refund request for payment that does not require it", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce(paymentPayloadExtended)
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({
      ...productPayloadExtended,
      isRefundable: true,
      refundRequiresApproval: false,
    })

    const call = refundRequestService.createRefundRequest(paymentPayloadExtended.id, userId, "Test reason")
    await expect(call).rejects.toThrowError("Product does not require approval")
  })

  it("fails to create refund request for payment that does not require it", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce(paymentPayloadExtended)
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({
      ...productPayloadExtended,
      isRefundable: true,
      refundRequiresApproval: true,
    })
    vi.spyOn(refundRequestRepository, "create").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "PENDING",
    })

    const call = refundRequestService.createRefundRequest(paymentPayloadExtended.id, userId, "Test reason")
    await expect(call).resolves.toEqual(refundRequestPayloadExtended)
    expect(refundRequestRepository.create).toHaveBeenCalledWith({
      paymentId: paymentPayloadExtended.id,
      userId,
      reason: "Test reason",
      status: "PENDING",
      handledBy: null,
    })
  })

  it("fails to approve refund request for already approved refund request", async () => {
    vi.spyOn(refundRequestRepository, "getById").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "APPROVED",
    })

    const call = refundRequestService.approveRefundRequest(refundRequestPayloadExtended.id, userId)
    await expect(call).rejects.toThrowError("Refund request already approved")
  })

  it("successfully approves pending refund request", async () => {
    vi.spyOn(refundRequestRepository, "getById").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "PENDING",
    })
    vi.spyOn(refundRequestRepository, "update").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "APPROVED",
      handledBy: userId,
    })
    vi.spyOn(paymentService, "refundPaymentById").mockResolvedValueOnce(undefined)

    const call = refundRequestService.approveRefundRequest(refundRequestPayloadExtended.id, userId)
    await expect(call).resolves.toEqual(undefined)
    expect(refundRequestRepository.update).toHaveBeenCalledWith(refundRequestPayloadExtended.id, {
      status: "APPROVED",
      handledBy: userId,
    })
  })

  it("successfully approves rejected refund request", async () => {
    vi.spyOn(refundRequestRepository, "getById").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "REJECTED",
    })
    vi.spyOn(refundRequestRepository, "update").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "APPROVED",
      handledBy: userId,
    })
    vi.spyOn(paymentService, "refundPaymentById").mockResolvedValueOnce(undefined)

    const call = refundRequestService.approveRefundRequest(refundRequestPayloadExtended.id, userId)
    await expect(call).resolves.toEqual(undefined)
    expect(refundRequestRepository.update).toHaveBeenCalledWith(refundRequestPayloadExtended.id, {
      status: "APPROVED",
      handledBy: userId,
    })
  })

  it("fails to reject refund request for already rejected refund request", async () => {
    vi.spyOn(refundRequestRepository, "getById").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "REJECTED",
    })

    const call = refundRequestService.rejectRefundRequest(refundRequestPayloadExtended.id, userId)
    await expect(call).rejects.toThrowError("Refund request already rejected")
  })

  it("fails to reject refund request for already approved refund request", async () => {
    vi.spyOn(refundRequestRepository, "getById").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "APPROVED",
    })

    const call = refundRequestService.rejectRefundRequest(refundRequestPayloadExtended.id, userId)
    await expect(call).rejects.toThrowError("Refund request already approved")
  })
})
