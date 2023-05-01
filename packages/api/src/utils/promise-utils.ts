export class AsyncEvent {
  private promise!: Promise<void>
  private resolve!: () => void

  constructor() {
    this.reset()
  }

  async wait() {
    await this.promise
  }

  set() {
    this.resolve()
  }

  reset() {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve
    })
  }
}
