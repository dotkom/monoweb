import { InsertPersonalMark } from "../personal-mark"
import { initPersonalMarkService } from "../personal-mark-service"
import { v4 as uuidv4 } from "uuid"
import { initPersonalMarkRepository } from "../personal-mark-repository"
import { NotFoundError } from "../../../errors/errors"
import { PrismaClient } from "@dotkom/db"
import { initMarkService } from "../mark-service"
import { initMarkRepository } from "../mark-repository"
import { InsertMark } from "../mark"

describe("PersonalMarkService", () => {
  const prisma = vi.mocked(PrismaClient, true)
  const personalMarkRepository = initPersonalMarkRepository(prisma)
  const markRepository = initMarkRepository(prisma)
  const markService = initMarkService(markRepository)
  const personalMarkService = initPersonalMarkService(personalMarkRepository, markService)
})
