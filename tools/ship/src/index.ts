import path from "node:path"
import process from "node:process"
import { Command } from "commander"
import { logger } from "./logger"
import { type EnvironmentName, resolveContext } from "./config"
import { build, getResolvedTag, push, tag } from "./docker"
import { createClientContext, getEcrAuthorizationToken } from "./aws"

const program = new Command("ship")

interface DeployOptions {
  env: EnvironmentName
}

program
  .command("deploy")
  .argument("directory")
  .option("-e, --env", "Environment to deploy", /^dev|stg|prd$/, "dev")
  .action(async (directory, options: DeployOptions) => {
    const relativePath = path.resolve("../../", directory)
    const buildRoot = path.resolve("../../")
    logger.info(`Deploying application at path: ${relativePath}`)
    logger.info(`Deploying to environment: ${options.env}`)
    const context = await resolveContext(relativePath, buildRoot, options.env)
    logger.info("Authenticating to AWS ECR Repository")
    const aws = await createClientContext()
    const credentials = await getEcrAuthorizationToken(aws)
    logger.info(`Building Docker image with tag '${getResolvedTag(context)}'`)
    await build(context)
    logger.info("Pushing Docker image to AWS ECR Repository")
    await tag(context)
    await push(context, credentials)
    logger.info("Push completed")
  })

program.parse(process.argv)
