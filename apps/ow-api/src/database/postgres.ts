import config from "config";
import { getLogger } from "ow-logger";
import { execa } from "execa";
import { DBConfig } from "../../config/types";
import prisma, { PrismaClient } from "@prisma/client";
import { seed } from "./seed";

const dbConfig = config.get<DBConfig>("database");
const logger = getLogger("database.migrater");

export const initPostgres = async (): Promise<PrismaClient> => {
  let host: string;
  let port: number;
  // Create a container if in DEV mode
  if (process.env.NODE_ENV === "development") {
    const container = await createPostgresContainer();
    host = container.getHost();
    port = container.getMappedPort(dbConfig.port);
    const url = constructDatabaseUrl({ ...dbConfig, host, port });
    logger.info(url);
    const { failed } = await execa("prisma", ["migrate", "dev"], {
      env: { DATABASE_URL: url },
    });
    if (failed) throw new Error("Could not migrate database");
    logger.info("successfully migrated database");
  } else {
    host = dbConfig.host;
    port = dbConfig.port;
  }
  const client = new prisma.PrismaClient({
    datasources: {
      db: {
        url: constructDatabaseUrl({ ...dbConfig, host: host, port: port }),
      },
    },
  });
  await client.$connect();
  if (process.env.NODE_ENV === "development") {
    seed(client);
  }
  return client;
};

export const createPostgresContainer = async () => {
  if (process.env.NODE_ENV === "development") {
    const { GenericContainer } = await import("testcontainers");
    logger.info("Spinning up Postgres container");
    const container = new GenericContainer("postgres")
      .withEnv("POSTGRES_USER", dbConfig.user)
      .withEnv("POSTGRES_PASSWORD", dbConfig.password)
      .withExposedPorts(dbConfig.port)
      .start();
    logger.info("Successfully created a Postgres container");
    return container;
  } else {
    throw new Error(
      "Tried to start Postgres container in a non-dev environment"
    );
  }
};

const constructDatabaseUrl = (config: DBConfig) => {
  const { user, password, host, port, database } = config;
  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
};
