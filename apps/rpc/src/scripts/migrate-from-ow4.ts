import { exit } from "node:process"

const PAGE_LIMIT = 20

export async function dumpOW4Data(url: string) {
  const result = []
  let page = 1
  const getUrl = (page: number) => `${url}&page=${page}`

  while (true) {
    const response = await fetch(getUrl(page))
    const data = await response.json()
    page++
    result.push(...data.results)

    if (page > PAGE_LIMIT) {
      console.error("Page limit reached")
      exit(1)
    }

    if (data.next === null) {
      break
    }
  }

  return result
}

export const DEFAULT_IMAGE_URL = "/placeholder.svg"
