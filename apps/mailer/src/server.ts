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
  const schema = mailSchema.safeParse(req.body)
  if (schema.success) {
    await mailService.send({
      ...schema.data,
      body: templateService.render("base", {
        body: templateService.transform(schema.data.body),
      }),
    })
    res.status(201).send("OK")
    return
  }
  res.status(400).send(schema.error.message)
})

app.listen(3000, () => console.log("Listening on port 3000"))
