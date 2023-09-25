import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider"

export interface CognitoService {

}

export class CognitoServiceImpl implements CognitoService {
    constructor(private readonly cognitoClient: CognitoIdentityProviderClient) {
    }
}
