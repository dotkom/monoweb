import { render } from "@react-email/render"
import { Email } from "./index"
import { SES } from "@aws-sdk/client-ses"

const emailHtml = render(<Email url="https://example.com" />)

const options = {
  Source: "dotkom@online.ntnu.no",
  Destination: {
    ToAddresses: ["mats.jun.larsen@online.ntnu.no"],
  },
  Message: {
    Body: {
      Html: {
        Charset: "UTF-8",
        Data: emailHtml,
      },
    },
    Subject: {
      Charset: "UTF-8",
      Data: "hello world",
    },
  },
}

const sendPromise = new SES({ apiVersion: "2010-12-01" }).sendEmail(options)
