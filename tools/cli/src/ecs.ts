import { DescribeTasksCommand, ListTasksCommand } from "@aws-sdk/client-ecs"
import { ecsClient } from "./aws"
import { config } from "./config"

export async function getServices() {
  const tasks = await ecsClient.send(
    new ListTasksCommand({
      cluster: config.cluster,
    })
  )
  const descriptions = await ecsClient.send(
    new DescribeTasksCommand({
      cluster: config.cluster,
      tasks: tasks.taskArns,
    })
  )
  return descriptions
}
