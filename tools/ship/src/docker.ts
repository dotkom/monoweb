import path from "node:path"
import Docker from "dockerode"
import walk from "ignore-walk"
import { type Context } from "./config"
import { logger } from "./logger"
import { type ECRCredential } from "./aws"

export const docker = new Docker({})

const getBuildContext = (buildRoot: string): string[] => {
  const dockerignore = path.join(buildRoot, ".dockerignore")
  logger.info(`Reading .dockerignore list from ${dockerignore}`)
  return walk.sync({
    path: buildRoot,
    ignoreFiles: [".dockerignore"],
    follow: true,
  })
}

export const getResolvedTag = (context: Context) => `${context.config.imageName}:${context.config.version}`
export const getResolvedRepositoryTag = (context: Context) =>
  `${context.environment.ecrRepository}:${context.config.version}`

export const build = async (context: Context) => {
  const files = getBuildContext(context.buildRoot)
  const output = await docker.buildImage(
    {
      context: context.buildRoot,
      src: files,
    },
    {
      t: getResolvedTag(context),
      dockerfile: context.environment.dockerfile,
    }
  )
  output.pipe(process.stdout)
  await new Promise((resolve, reject) => {
    docker.modem.followProgress(output, (err, res) => (err ? reject(err) : resolve(res)))
  })
}

export const tag = async (context: Context) => {
  const builtImage = docker.getImage(getResolvedTag(context))
  await builtImage.tag({
    repo: context.environment.ecrRepository,
    tag: context.config.version,
  })
}

export const push = async (context: Context, credentials: ECRCredential) => {
  const builtImage = docker.getImage(getResolvedRepositoryTag(context))
  const jwt = Buffer.from(credentials.token, "base64").toString().split(":")[1]
  const output = await builtImage.push({
    authconfig: {
      username: "AWS",
      password: jwt,
      serveraddress: credentials.endpoint,
    },
    tag: context.config.version,
  })
  output.pipe(process.stdout)
  await new Promise((resolve, reject) => {
    docker.modem.followProgress(output, (err, res) => (err ? reject(err) : resolve(res)))
  })
}
