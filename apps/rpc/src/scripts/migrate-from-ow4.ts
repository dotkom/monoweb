import { exit } from "node:process"

const PAGE_LIMIT = 50000

export async function dumpOW4Data(url: string) {
  const result = []
  let page = 1
  const getUrl = (page: number) => `${url}&page=${page}`
  let total = "?"

  while (true) {
    console.log(`Fetching page ${page} of ${url} (${result.length}/${total})`)
    const response = await fetch(getUrl(page))
    // biome-ignore lint/suspicious/noExplicitAny: script, we dont care
    const data: any = await response.json()
    total = data.count.toString()
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
