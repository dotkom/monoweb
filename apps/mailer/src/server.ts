import express, { json, Request, Response } from "express"
import { initMailService } from "./mail-service"
import { mailSchema } from "./mail"
import { initMarkdownService } from "./markdown-service"

// Development server for testing the mailing functionality without requiring
// to run on AWS Lambda.
const app = express()

app.use(json())

const markdownService = initMarkdownService()
const mailService = initMailService(markdownService)

app.post("/", async (req: Request, res: Response) => {
  const data = mailSchema.safeParse(req.body)
  if (data.success) {
    await mailService.send(data.data)
    res.status(201).send("OK")
    return
  }
  res.status(400).send(data.error.message)
})

app.listen(3000, () => console.log("Listening on port 3000"))
