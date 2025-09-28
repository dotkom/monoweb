import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts"
import { getLogger } from "@dotkomonline/logger"
import { trace } from "@opentelemetry/api"
import type { Configuration } from "./configuration"

const logger = getLogger("rpc/aws")

export async function identifyCallerIAMIdentity(configuration: Configuration) {
  await trace
    .getTracer("@dotkomonline/rpc/aws-caller-identity")
    .startActiveSpan("AWS/QueryCallingIdentity", async (span) => {
      try {
        const stsClient = new STSClient({ region: configuration.AWS_REGION })
        const identity = await stsClient.send(new GetCallerIdentityCommand({}))
        logger.debug(`AWS credentials verified successfully: ${identity.Arn}`)
      } catch (error) {
        logger.warn(
          "WARNING: Unable to verify AWS credentials. Functionality involving aws services, e.g. uploading files, will fail."
        )
      } finally {
        span.end()
      }
    })
}
