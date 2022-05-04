import express, { json, Request, Response } from "express"
import { initMailService } from "./mail-service"
import { initTemplateService } from "./template-service"
import { mailSchema } from "./mail"

// Development server for testing the mailing functionality without requiring
// to run on AWS Lambda.
const app = express()

app.use(json())

const templateService = initTemplateService()
const mailService = initMailService()

app.post("/", async (req: Request, res: Response) => {
  const data = mailSchema.safeParse(req.body)
  if (data.success) {
    await mailService.send({
      ...data.data,
      body: templateService.render("base", {
        body: templateService.transform(data.data.body),
      }),
    })
    res.status(201).send("OK")
    return
  }
  res.status(400).send(data.error.message)
})

app.listen(3000, () => console.log("Listening on port 3000"))
