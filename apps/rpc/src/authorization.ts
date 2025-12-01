/**
 * A simple authorization logic library composed by boolean logic functions.
 *
 * Authorization is the task of deciding which principals (users) are allowed to perform which actions on which
 * resources. Making a decision is a boolean problem which results in either permit or deny.
 *
 * Following the Principle of Least Privilege (POLP), we should by default deny any action, and only give principals
 * the minimal set of permissions required for their work. See the following resources on POLP:
 *
 * 1. https://en.wikipedia.org/wiki/Principle_of_least_privilege
 * 2. https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started-reduce-permissions.html
 *
 * Any action should be by-default denied unless explicitly granted access, meaning that in practice, all endpoints
 * are private, unless made public explicitly.
 *
 * This file contains a general framework for boolean predicates, and combinator functions to build rules.
 *
 * The goal is to use the combinators along with the `authorized()` middleware from `/src/middlewares.ts` to create
 * authorization guards for API endpoints.
 *
 * # Further reading
 *
 * - https://en.wikipedia.org/wiki/Combinatory_logic
 * - https://en.wikipedia.org/wiki/Boolean_algebra
 * - https://docs.cedarpolicy.com/overview/terminology.html
 * - https://www.openpolicyagent.org/docs/comparisons/access-control-systems
 *
 * NOTE: For future reference, we selected a home-made simple combinator function framework for authorization rules for
 * Monoweb following evaluation of Cedar Policy and Open Policy Agent. While Cedar/OPA are more powerful and expressive
 * options, we believe this is a simpler framework that is easier for beginners to learn given that students learn
 * boolean algebra in MA0301 Elementary Discrete Mathematics and TDT4120 Algorithms & Data Structures.
 *
 * @packageDocumentation
 */

import { ADMIN_EDITOR_ROLES, type EditorRole } from "./modules/authorization-service"
import type { Context, Principal } from "./trpc"

export interface RuleContext<TInput> {
  input: TInput
  /** The rule context does not make any assumptions on the availability of a Principal */
  principal: Principal | null
  ctx: Context
  /**
   * Evaluate another rule.
   *
   * This function should be used by combinators that compose other rules, such as or() and and().
   */
  evaluate<TRuleInput>(rule: Rule<TRuleInput>, context: RuleContext<TRuleInput>): Promise<boolean> | boolean
}

export interface Rule<TInput> {
  evaluate(context: RuleContext<TInput>): Promise<boolean> | boolean
}

/** Combinator rule that returns true if any of its input evaluate to true */
export function or<TInput>(rule: Rule<TInput>, ...rules: Rule<TInput>[]): Rule<TInput> {
  return {
    async evaluate(context) {
      const children = [rule, ...rules]
      const decisions = await Promise.all(children.map((rule) => context.evaluate(rule, context)))
      return decisions.some((v) => v)
    },
  }
}

/** Combinator rule that returns true if all its inputs evaluate to true */
export function and<TInput>(rule: Rule<TInput>, ...rules: Rule<TInput>[]): Rule<TInput> {
  return {
    async evaluate(context) {
      const children = [rule, ...rules]
      const decisions = await Promise.all(children.map((rule) => context.evaluate(rule, context)))
      return decisions.every((v) => v)
    },
  }
}

/** Logic rule that always returns true */
export function permit<TInput>(): Rule<TInput> {
  return {
    evaluate() {
      return true
    },
  }
}

/** Logic rule that always returns false */
export function deny<TInput>(): Rule<TInput> {
  return {
    evaluate() {
      return false
    },
  }
}

/**
 * Business rule that returns true if the user is considered an administrator
 *
 * We consider a principal to be an administrator if they are a member of Hovedstyret (HS) or Dotkom
 */
export function isAdministrator<TInput>(): Rule<TInput> {
  return {
    evaluate(context) {
      if (context.principal === null) {
        return false
      }
      for (const editorRole of context.principal.editorRoles) {
        // biome-ignore lint/suspicious/noExplicitAny: Array#includes has terrible typing
        if (ADMIN_EDITOR_ROLES.includes(editorRole as any)) {
          return true
        }
      }
      return false
    },
  }
}

/**
 * Business rule that returns true if the user is considered an editor
 *
 * We consider a principal to be an editor if they are a member of any committee
 */
export function isEditor<TInput>(): Rule<TInput> {
  return {
    evaluate(context) {
      if (context.principal === null) {
        return false
      }
      return context.principal.editorRoles.size !== 0
    },
  }
}

/**
 * Business rule that returns true if the user is a member of the given group
 */
export function isGroupMember<TInput>(editorRole: EditorRole): Rule<TInput> {
  return {
    evaluate(context) {
      if (context.principal === null) {
        return false
      }
      return context.principal.editorRoles.has(editorRole)
    },
  }
}
