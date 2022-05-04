import { BaseTemplateProps, template as baseTemplate } from "./templates/base"

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

// Mapping of available templates to their properties
export interface TemplateMap {
  base: BaseTemplateProps
}

// Mapping of templates to their respective functions
const templates: Record<keyof TemplateMap, Template<TemplateMap[keyof TemplateMap]>> = {
  base: baseTemplate,
}
