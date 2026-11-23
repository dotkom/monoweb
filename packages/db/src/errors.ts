import { Prisma } from "../generated/prisma/client"

// https://www.prisma.io/docs/orm/reference/error-reference
export const PrismaErrorCode = {
  ConnectionPoolTimeout: "P2024",
  RecordNotFound: "P2025",
  TransactionApiError: "P2028",
  WriteConflictOrDeadlock: "P2034",
} as const

/**
 * This means that the record was not found, and the operation was aborted.
 *
 * If the query used an expected state, this could be a result of a concurrent modification.
 */
export const isRecordNotFoundError = (error: unknown): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === PrismaErrorCode.RecordNotFound
}
