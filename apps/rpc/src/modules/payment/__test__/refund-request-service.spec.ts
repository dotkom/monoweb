import { randomUUID } from "node:crypto"
import type { RefundRequestWrite } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { describe, vi } from "vitest"
import { IllegalStateError } from "../../../error"
import { getEventRepository } from "../../event/event-repository"
import { UnrefundablePaymentError } from "../payment-error"
import { getPaymentRepository } from "../payment-repository"
import { getPaymentService } from "../payment-service"
import { getProductRepository } from "../product-repository"
import { InvalidRefundRequestStatusError } from "../refund-request-error"
import { getRefundRequestRepository } from "../refund-request-repository"
import { getRefundRequestService } from "../refund-request-service"
import { paymentPayload } from "./payment-service.spec"
import { productPayload } from "./product-service.spec"

// biome-ignore lint/suspicious/noExportsInTest: this is shared across multiple tests
export const refundRequestPayload: RefundRequestWrite = {
  paymentId: randomUUID(),
  userId: randomUUID(),
  reason: "I want my money back",
  status: "PENDING",
  handledById: null,
}

describe("RefundRequestService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  const refundRequestRepository = getRefundRequestRepository()
  const paymentRepository = getPaymentRepository()
  const productRepository = getProductRepository()
  const eventRepository = getEventRepository()
  const paymentService = getPaymentService(
    paymentRepository,
    productRepository,
    eventRepository,
    refundRequestRepository,
    {}
  )
  const refundRequestService = getRefundRequestService(
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

    const call = refundRequestService.createRefundRequest(db, paymentPayloadExtended.id, userId, "Test reason")
    await expect(call).rejects.toThrowError(UnrefundablePaymentError)
  })

  it("fails to create refund request for payment that does not require it", async () => {
    vi.spyOn(paymentRepository, "getById").mockResolvedValueOnce(paymentPayloadExtended)
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({
      ...productPayloadExtended,
      isRefundable: true,
      refundRequiresApproval: false,
    })

    const call = refundRequestService.createRefundRequest(db, paymentPayloadExtended.id, userId, "Test reason")
    await expect(call).rejects.toThrowError(IllegalStateError)
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const call = refundRequestService.createRefundRequest(db, paymentPayloadExtended.id, userId, "Test reason")
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const call = refundRequestService.approveRefundRequest(db, refundRequestPayloadExtended.id, userId)
    await expect(call).rejects.toThrowError(InvalidRefundRequestStatusError)
  })

  it("successfully approves pending refund request", async () => {
    vi.spyOn(refundRequestRepository, "getById").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.spyOn(refundRequestRepository, "update").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "APPROVED",
      handledById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.spyOn(paymentService, "refundPaymentById").mockResolvedValueOnce(undefined)

    const call = refundRequestService.approveRefundRequest(db, refundRequestPayloadExtended.id, userId)
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.spyOn(refundRequestRepository, "update").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "APPROVED",
      handledById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.spyOn(paymentService, "refundPaymentById").mockResolvedValueOnce(undefined)

    const call = refundRequestService.approveRefundRequest(db, refundRequestPayloadExtended.id, userId)
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const call = refundRequestService.rejectRefundRequest(db, refundRequestPayloadExtended.id, userId)
    await expect(call).rejects.toThrowError(InvalidRefundRequestStatusError)
  })

  it("fails to reject refund request for already approved refund request", async () => {
    vi.spyOn(refundRequestRepository, "getById").mockResolvedValueOnce({
      ...refundRequestPayloadExtended,
      status: "APPROVED",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const call = refundRequestService.rejectRefundRequest(db, refundRequestPayloadExtended.id, userId)
    await expect(call).rejects.toThrowError(InvalidRefundRequestStatusError)
  })
})
