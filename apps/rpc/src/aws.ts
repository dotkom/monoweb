import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts"
import { getLogger } from "@dotkomonline/logger"
import { trace } from "@opentelemetry/api"
import { env } from "./env"

const logger = getLogger("rpc/aws")
const tracer = trace.getTracer("rpc/aws")

export async function identifyCallerIAMIdentity() {
  await tracer.startActiveSpan("identifyCallerIAMIdentity", async (span) => {
    try {
      const stsClient = new STSClient({ region: env.AWS_REGION })
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
