import { mockDeep } from "jest-mock-extended"
import { MailRequest, MailService } from "../mail-service";

describe("MailService", () => {
  const mailService = mockDeep<MailService>()

  it("should invoke both markdown and template service with data", async () => {
    const request: MailRequest = {
      sender: "dotkom@online.ntnu.no",
      recipients: ["mats.jun.larsen@online.ntnu.no"],
      carbonCopy: [],
      blindCarbonCopy: [],
      subject: "Hello world",
      body: "# Hello world",
    }

    mailService.send.mockResolvedValueOnce(Promise.resolve())
    const result = await mailService.send(request)
    expect(result).toBeUndefined()
    expect(mailService.send).toHaveBeenCalledWith(request)
  })
})
