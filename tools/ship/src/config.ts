import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { z } from "zod"
import invariant from "tiny-invariant"
import { logger } from "./logger"

export type EnvironmentName = DeployEnvironment["name"]
export type DeployEnvironment = z.infer<typeof DeployEnvironment>
export const DeployEnvironment = z.object({
  name: z.enum(["dev", "prd"]),
  ecrRepository: z.string().min(1, "ECR Repository name cannot be empty"),
  functionName: z.string().min(1, "AWS Lambda function name cannot be empty"),
  dockerfile: z.string(),
})

export type Config = z.infer<typeof Config>
export const Config = z.object({
  imageName: z.string().min(1, "Docker image name cannot be empty"),
  version: z.string().default("latest"),
  environments: z
    .array(DeployEnvironment)
    .nonempty("Configuration file does not contain any environment configurations"),
})

export interface Context {
  buildRoot: string
  basePath: string
  config: Config
  environment: DeployEnvironment
}

/**
 * Get the resolved configuration file path for a project.
 *
 * If a directory is passed, for example apps/web, then we will attempt to resolve apps/web/ship.json,
 * otherwise try to resolve the file path.
 */
const getConfigurationFile = async (basePath: string): Promise<string> => {
  const stat = await fs.stat(path.resolve(basePath))
  if (stat.isDirectory()) {
    return path.join(basePath, "ship.json")
  }
  invariant(
    stat.isFile() || stat.isSymbolicLink(),
    "Path cannot point to a file descriptor that is not a file or a symbolic link"
  )
  return basePath
}

const readConfiguration = async (basePath: string): Promise<Config> => {
  const file = await getConfigurationFile(basePath)
  logger.info(`Resolved configuration file ${file}`)
  const content = await fs.readFile(file, "utf-8")
  try {
    const json = await JSON.parse(content)
    const result = Config.safeParse(json)
    invariant(result.success, "JSON did not match schema")
    return result.data
  } catch (err) {
    logger.error(`File contents of ${file} did not contain valid JSON`)
    throw process.exit(1)
  }
}

export const resolveContext = async (basePath: string, buildRoot: string, env: EnvironmentName): Promise<Context> => {
  const config = await readConfiguration(basePath)
  const match = config.environments.find((e) => e.name === env)
  invariant(match !== undefined, `Found no environment named ${env} in configuration`)
  return {
    environment: match,
    config,
    buildRoot,
    basePath,
  }
}
