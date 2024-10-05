export default function assert(condition: unknown, error: Error): asserts condition {
  if (!condition) {
    throw error
  }
}
