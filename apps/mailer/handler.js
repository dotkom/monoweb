/* eslint-disable @typescript-eslint/no-var-requires */
const aws = require("aws-sdk")
const ses = new aws.SES({ region: "eu-north-1" })

const buildReturnStmt = (statusCode, msg) => {
  if (!msg) return { statusCode: statusCode }

  return {
    statusCode: statusCode,
    body: JSON.stringify({ message: msg }),
  }
}

async function sendMail(sender, recipient, subject, data) {
  const emailParams = {
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: { Data: data },
      },
      Subject: { Data: subject },
    },
    Source: sender,
  }

  await ses.sendEmail(emailParams).promise()
}

exports.main = async (event, _) => {
  let sender, recipient, subject, body

  try {
    ;({ sender, recipient, subject, body } = JSON.parse(event["body"]))
  } catch (err) {
    return buildReturnStmt(400, "Invalid arguments")
  }

  try {
    await sendMail(sender, recipient, subject, body)
  } catch (e) {
    return buildReturnStmt(500, `There occured an error sending mail (${e.message})`)
  }

  return buildReturnStmt(201, "Successfully sent mail.")
}
