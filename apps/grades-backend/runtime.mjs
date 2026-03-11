import path from "node:path"
import { URL } from "node:url"

export async function resolve(specifier, context, nextResolve) {
  // Only handle relative or absolute paths without extensions
  if (
    (specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/")) &&
    !path.extname(specifier)
  ) {
    // Try with .ts extension first
    const tsFile = `${specifier}.ts`
    const resolvedTsPath = new URL(tsFile, context.parentURL).href
    return {
      url: resolvedTsPath,
      shortCircuit: true,
    }
  }

  // Let Node.js handle it if no match
  return nextResolve(specifier)
}
