import { createServiceLayer, ServiceLayer } from "./server"

export const core: ServiceLayer = createServiceLayer({
  dynamoTableName: "wiki-staging",
  s3BucketName: "cdn.wiki.staging.online.ntnu.no",
})
