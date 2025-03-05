import { env } from "./env"

// Verify AWS credentials using STS
export async function verifyAwsCredentials() {
  try {
    // Import the STS client and GetCallerIdentityCommand
    const { STSClient, GetCallerIdentityCommand } = await import("@aws-sdk/client-sts")
    const stsClient = new STSClient({ region: env.AWS_REGION })

    // GetCallerIdentity is the lightest-weight operation to verify credentials
    const identity = await stsClient.send(new GetCallerIdentityCommand({}))
    console.debug(`AWS credentials verified successfully. Using identity: \n${identity.Arn}`)
  } catch (error) {
    console.warn(
      "WARNING: Unable to verify AWS credentials. Functionality involving aws services, e.g. uploading files, will fail."
    )
  }
}
