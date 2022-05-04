import { template as baseTemplate } from "./templates/base"

// Mapping of templates to their respective functions
const templates = {
  base: baseTemplate,
} as const

export interface TemplateService {
  render<K extends keyof TemplateMap>(name: K, props: TemplateMap[K]): string
}

export const initTemplateService = (): TemplateService => {
  return {
    render: <K extends keyof TemplateMap>(name: K, props: TemplateMap[K]) => {
      return templates[name](props)
    },
  }
}

export type Template<T> = (props: T) => string
export type TemplateMap = {
  [K in keyof typeof templates]: typeof templates[K] extends Template<infer U> ? U : never
}
