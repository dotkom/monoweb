import { template as baseTemplate } from "./templates/base"
import { marked } from "marked"

// Mapping of templates to their respective functions
const templates = {
  base: baseTemplate,
} as const

export interface TemplateService {
  /** Render a named template with that template's arguments into HTML */
  render<K extends keyof TemplateMap>(name: K, props: TemplateMap[K]): string

  /** Transform Markdown into HTML */
  transform(markdown: string): string
}

export const initTemplateService = (): TemplateService => {
  return {
    render: <K extends keyof TemplateMap>(name: K, props: TemplateMap[K]) => {
      return templates[name](props)
    },
    transform: (markdown: string): string => {
      return marked.parse(markdown)
    },
  }
}

export type Template<T> = (props: T) => string
export type TemplateMap = {
  [K in keyof typeof templates]: typeof templates[K] extends Template<infer U> ? U : never
}
