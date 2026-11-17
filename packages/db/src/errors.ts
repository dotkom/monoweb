import { Prisma } from "../generated/prisma/client"

export const PrismaErrorCode = {
  // https://www.prisma.io/docs/orm/reference/error-reference#ORM.MUTATION_ROW_MISSING
  RecordNotFound: "P2025",
} as const

/**
 * This means that the record was not found, and the operation was aborted.
 *
 * If the query used an expected state, this could be a result of a concurrent modification.
 */
export const isRecordNotFoundError = (error: unknown): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === PrismaErrorCode.RecordNotFound
}
