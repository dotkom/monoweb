import { timingSafeEqual } from "node:crypto"
import type { FastifyInstance } from "fastify"
import { z } from "zod"
import type { ServiceLayer } from "../modules/core"

const CheckinBodySchema = z.object({
  userRfid: z.string().min(1),
})

function isAuthorized(authorization: string | undefined, secretKey: string): boolean {
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : ""
  const tokenBuffer = Buffer.from(token)
  const secretBuffer = Buffer.from(secretKey)

  return (
    Boolean(token) &&
    Boolean(secretKey) &&
    tokenBuffer.length === secretBuffer.length &&
    timingSafeEqual(tokenBuffer, secretBuffer)
  )
}

export function registerCheckinRoutes(server: FastifyInstance, serviceLayer: ServiceLayer, secretKey: string) {
  server.post("/checkin", async (req, res) => {
    if (!isAuthorized(req.headers.authorization, secretKey)) {
      return res.status(401).send()
    }

    const body = CheckinBodySchema.safeParse(req.body)
    if (!body.success) {
      return res.status(400).send()
    }

    const checkin = await serviceLayer.officeCheckinsService.checkIn(serviceLayer.prisma, body.data.userRfid)
    return res.status(201).send(checkin)
  })

  server.get("/checkin/leaderboard", async (req, res) => {
    if (!isAuthorized(req.headers.authorization, secretKey)) {
      return res.status(401).send()
    }

    const leaderboard = await serviceLayer.officeCheckinsService.getLeaderboard(serviceLayer.prisma)
    return res.send(leaderboard)
  })

  server.post("/checkin/link-url", async (req, res) => {
    if (!isAuthorized(req.headers.authorization, secretKey)) {
      return res.status(401).send()
    }

    const body = CheckinBodySchema.safeParse(req.body)
    if (!body.success) {
      return res.status(400).send()
    }

    return res.send(serviceLayer.officeCheckinsService.createLinkUrl(body.data.userRfid))
  })
}
