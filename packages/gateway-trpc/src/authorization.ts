import * as path from "node:path"
import type { OAuthScope } from "@dotkomonline/oauth2"
import type {
  Article,
  Company,
  Event,
  Group,
  InterestGroup,
  JobListing,
  Mark,
  Offline,
  Payment,
  PersonalMark,
  User,
} from "@dotkomonline/types"
import { type LoadedPolicy, loadPolicy } from "@open-policy-agent/opa-wasm"
import { z } from "zod"
import type { AppRouterAction } from "./trpc"

export class AuthorizationError extends Error {}
export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export interface AuthorizationPrincipal {
  /**
   * The subject name of the principal.
   *
   * This is either the Auth0 user subject, or the OAuth2 client id in the case
   * of machine-to-machine authentication using client_credentials flow.
   */
  subject: string
  /**
   * Authenticated OAuth2 scopes the principal has access to.
   */
  scopes: OAuthScope[]
}

export type Resource =
  | Article
  | Company
  | Event
  | Group
  | InterestGroup
  | JobListing
  | Mark
  | PersonalMark
  | Offline
  | Payment
  | User

/**
 * A basic authorization service based on the PARC model.
 *
 * Open Policy Agent will hereafter be referred to as OPA.
 *
 * Author @junlarsen loosely modelled this after the Cedar policy language which
 * is very similar to AWS IAM policies. However, OPA has (at time of writing) a
 * significantly better WASM user experience, so we use OPA as the underlying
 * evaluation engine.
 *
 * @see https://jun.codes/blog/authorization-with-cedar
 *
 * OPA has a very flexible policy language that lets you formulate policies in a
 * very expressive way. However, we want to keep things standardized and simple,
 * so we will use a specific pattern for our policies. OPA has to be flexible,
 * because its built to support a wide range of use cases. However, we primarily
 * want to use it for permit/deny decisions so we will simplify things a bit.
 *
 * # Primer to OPA
 *
 * OPA is a policy engine that uses a declarative language called Rego to
 * define rules. A rule evaluates to a map of properties (think of the output as
 * a JSON object). An evaluation request takes in some `input`, as well as some
 * optional `data`.
 *
 * The `input` is another JSON object that contains the request context. This is
 * the variable that our decisions are based on. Here, it is natural to put the
 * user who is making a request, as well as what operation they are trying to do
 * and what resource or entity they are trying to access.
 *
 * # PARC Model
 *
 * The PARC model consists of these three components, as well as optional
 * conditions.
 *
 * 1. **Principal**: The user or entity making the request. In most cases, this
 *    is the user who made a click on the website, but it can also be another
 *    server that's making a request to the API.
 *
 * 2. **Action**: The operation the principal is trying to perform. This is a
 *    verb, such as "read" or "write", typically prefixed with the resource type
 *    (e.g. "user.read" or "user.write").
 *
 * 3. **Resource**: The entity the principal is trying to access. This is
 *    for example the event that a user is trying to sign up to, or an image
 *    they wish to upload.
 *
 * 4. **Condition**: An optional set of conditions that must be met for the
 *    policy to be permitted. This can be restricting users to only edit posts
 *    that they have created.
 *
 * Conditions are the most flexible part, as they describe more fine-grained
 * rules. It might be imperative that all users are allowed to view events, and
 * they might also have edit permission, but they should only be allowed to edit
 * certain events. Conditions are used to encode logic like this.
 *
 * # Monoweb Authorization Policy Guidelines
 *
 * Policy evaluations are required to always return an object that has either or
 * both `permit` and `deny` properties, both of which must be booleans. Deny
 * overrides permit, so if both are present, the policy is denied. If no
 * policies are matched, the default result is `{ permit: false }`.
 *
 * The Rego `input` variable will have three properties: `principal`, `action`
 * and `resource`. Make your decisions based on these.
 *
 * # Example
 *
 * ```rego
 * package auth
 *
 * package auth
 *
 * default permit := false
 *
 * permit if {
 *  input.action == "user.get"
 *  input.resource.sub == input.principal.subject
 * }
 * ```
 *
 * The policies can be found in the `policy.rego` file.
 */
export class AuthorizationService {
  private readonly policyEvaluator: LoadedPolicy

  public static async create(): Promise<AuthorizationService> {
    const distPath = path.relative(import.meta.url, "../dist/policy.wasm")
    const policyEvaluator = await loadPolicy(distPath)
    return new AuthorizationService(policyEvaluator)
  }

  public constructor(policyEvaluator: LoadedPolicy) {
    this.policyEvaluator = policyEvaluator
  }

  /** Evaluate a policy decision based on the principal, action and resource. */
  public evaluate(principal: AuthorizationPrincipal, action: AppRouterAction, resource: Resource) {
    const input = {
      principal,
      action,
      resource,
    } as const
    const output = this.policyEvaluator.evaluate(input)
    const result = PolicyEvaluationResult.safeParse(output)
    if (!result.success) {
      throw new AuthorizationError(`policy evaluation returned malformed object: ${result.error.message}`)
    }
    const decision = result.data
    // Deny should always override permit
    if (decision.deny !== undefined) {
      return decision.deny
    }
    if (decision.permit !== undefined) {
      return decision.permit
    }
    throw new AuthorizationError("policy evaluation returned neither permit nor deny")
  }
}

const PolicyEvaluationResult = z.object({
  permit: z.boolean().optional(),
  deny: z.literal(true).optional(),
})
