import Queue from "p-queue"
const defaultConcurrency = parseInt(process.env.MAX_CONCURRENCY ?? "10")

export interface AsyncExecuteOptions {
  build(queue: Queue, concurrency: number): void
  onTaskComplete(remainingTasks: number): void
  concurrency?: number
}

export const executeWithAsyncQueue = async ({
  build,
  onTaskComplete,
  concurrency = defaultConcurrency,
}: AsyncExecuteOptions) => {
  const queue = new Queue({ concurrency })
  queue.on("next", () => onTaskComplete(queue.size))
  build(queue, concurrency)
  await queue.onIdle()
}
