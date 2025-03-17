import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts"
import { getLogger } from "@dotkomonline/logger"
import { env } from "./env"

const logger = getLogger("rpc/aws")

export async function verifyIdentityCredenetials() {
  try {
    // Import the STS client and GetCallerIdentityCommand
    const stsClient = new STSClient({ region: env.AWS_REGION })
    // GetCallerIdentity is the lightest-weight operation to verify credentials
    const identity = await stsClient.send(new GetCallerIdentityCommand({}))
    logger.debug(`AWS credentials verified successfully: ${identity.Arn}`)
  } catch (error) {
    logger.warn(
      "WARNING: Unable to verify AWS credentials. Functionality involving aws services, e.g. uploading files, will fail."
    )
  }
}
