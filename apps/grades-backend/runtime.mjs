import path from "node:path"
import { existsSync } from "node:fs"
import { fileURLToPath, URL } from "node:url"

export async function resolve(specifier, context, nextResolve) {
  // Only handle relative or absolute paths without extensions
  if (
    (specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/")) &&
    !path.extname(specifier)
  ) {
    // Try with .ts extension first
    const tsFile = `${specifier}.ts`
    const resolvedTsUrl = new URL(tsFile, context.parentURL)
    if (existsSync(fileURLToPath(resolvedTsUrl))) {
      return {
        url: resolvedTsUrl.href,
        shortCircuit: true,
      }
    }
  }

  // Let Node.js handle it if no match
  return nextResolve(specifier)
}
