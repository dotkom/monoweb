import { marked } from "marked"

export interface MarkdownService {
  transform(markdown: string): string
}

export const initMarkdownService = (): MarkdownService => {
  return {
    transform: (markdown: string): string => {
      return marked.parse(markdown)
    },
  }
}
