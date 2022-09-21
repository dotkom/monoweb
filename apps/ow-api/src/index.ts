import { getLogger } from "@dotkom/logger"
import { initUserRepository } from "./modules/auth/user-repository.js"
import { initUserService } from "./modules/auth/user-service.js"
import { PrismaClient } from "@dotkom/db"

const logger = getLogger(import.meta.url)
const client = new PrismaClient()

// Repositories
const userRepository = initUserRepository(client)

// Services
const userService = initUserService(userRepository)
