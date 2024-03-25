import { beforeAll, afterAll } from "vitest"
import { createServiceLayer, ServiceLayer } from "./src/server/server"
import { CreateBucketCommand, DeleteBucketCommand, S3Client } from "@aws-sdk/client-s3"
import { CreateTableCommand, DeleteTableCommand, DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb"

const s3BucketName = `wiki-test-${crypto.randomUUID()}`
const dynamoTableName = `wiki-test-${crypto.randomUUID()}`

const s3Client = new S3Client({})
const dynamoDbClient = new DynamoDBClient({})

export const createServiceLayerForTesting = (): ServiceLayer =>
  createServiceLayer({
    s3BucketName,
    dynamoTableName,
  })

beforeAll(async () => {
  console.log("Creating resources for integration tests")
  await s3Client.send(new CreateBucketCommand({ Bucket: s3BucketName }))
  const dynamoOutput = await dynamoDbClient.send(
    new CreateTableCommand({
      TableName: dynamoTableName,
      AttributeDefinitions: [
        { AttributeName: "Id", AttributeType: "S" },
        { AttributeName: "ParentId", AttributeType: "S" },
        { AttributeName: "Title", AttributeType: "S" },
        { AttributeName: "Slug", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "Id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        {
          IndexName: "ParentId",
          KeySchema: [{ AttributeName: "ParentId", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
        {
          IndexName: "Title",
          KeySchema: [{ AttributeName: "Title", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
        {
          IndexName: "Slug",
          KeySchema: [{ AttributeName: "Slug", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    })
  )
  let status = dynamoOutput.TableDescription?.TableStatus ?? "CREATING"
  console.log("Waiting for DynamoDB Table to provision")
  while (status !== "ACTIVE") {
    await new Promise((resolve) => setTimeout(resolve, 7500))
    const output = await dynamoDbClient.send(new DescribeTableCommand({ TableName: dynamoTableName }))
    status = output.Table?.TableStatus ?? "CREATING"
  }
  console.log("DynamoDB Table fully provisioned")
}, 300 * 1000)

afterAll(async () => {
  await s3Client.send(new DeleteBucketCommand({ Bucket: s3BucketName }))
  await dynamoDbClient.send(new DeleteTableCommand({ TableName: dynamoTableName }))
}, 300 * 1000)
