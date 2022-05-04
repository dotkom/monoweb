import { MailService, initMailService } from "./mail-service";
import { APIGatewayProxyHandler } from "aws-lambda";

const mailService: MailService = initMailService();

export const handler: APIGatewayProxyHandler = async (event) => {
    
}