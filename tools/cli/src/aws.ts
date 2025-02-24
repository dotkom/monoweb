import { EC2Client } from "@aws-sdk/client-ec2"
import { ECSClient } from "@aws-sdk/client-ecs"

export const ecsClient = new ECSClient()
export const ec2Client = new EC2Client()
