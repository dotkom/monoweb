import { mockDeep } from "jest-mock-extended"
import { initMailService, MailRequest } from "../mail-service"
import { TemplateService } from "../template-service"
import { MarkdownService } from "../markdown-service"

describe("MailService", () => {
  const templateService = mockDeep<TemplateService>()
  const markdownService = mockDeep<MarkdownService>()
  const mailService = initMailService(markdownService, templateService)

  it("should invoke both markdown and template service with data", async () => {
    const request: MailRequest = {
      sender: "prokom@online.ntnu.no",
      recipients: ["dotkom@online.ntnu.no"],
      carbonCopy: [],
      blindCarbonCopy: [],
      subject: "Hello world",
      body: "# Hello world",
    }

    templateService.render.mockReturnValueOnce("<html>Hello world</html>")
    markdownService.transform.mockReturnValueOnce("<h1>Hello world</h1>")
    await expect(mailService.send(request)).resolves.toBeUndefined()
    expect(templateService.render).toHaveBeenCalledWith("# Hello world")
    expect(markdownService.transform).toHaveBeenCalledWith("base", { body: "<h1>Hello world</h1>" })
  })
})
