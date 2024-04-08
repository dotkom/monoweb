import { z } from "zod"
import { Transaction, TransactionSchema } from "./domain"
import { GetObjectCommand, PutObjectCommand, S3Client, ErrorDocument } from "@aws-sdk/client-s3"

const StateSchema = z.object({
  transactions: z.array(TransactionSchema),
  lastHistoryId: z.string().nullable(),
  processedEmailIds: z.array(z.string()),
  socketConnectionIds: z.array(z.string()),
})

type State = z.infer<typeof StateSchema>

export interface StateService {
  getTransactionList(): Promise<Transaction[]>
  setTransactionList(transactions: Transaction[]): Promise<Transaction[]>
  getLastProcessedHistoryId(): Promise<string | null>
  setLastProcessedHistoryId(historyId: string | null): Promise<string | null>
  getProcessedEmailIds(): Promise<string[]>
  setProcessedEmailIds(emailIds: string[]): Promise<string[]>
  getSocketConnectionIds(): Promise<string[]>
  addSocketConnectionId(connectionId: string): Promise<string[]>
  removeSocketConnectionId(connectionId: string): Promise<string[]>
  getFullState(): Promise<State>
}

const StoredStateSchema = z.object({
  transactions: z.array(
    TransactionSchema.extend({
      datetime: z.string(),
    })
  ),
  lastHistoryId: z.string().nullable(),
  processedEmailIds: z.array(z.string()),
  socketConnectionIds: z.array(z.string()),
})

type StoredState = z.infer<typeof StoredStateSchema>

export interface FileRepository {
  setRootPath(path: string): void
  // If the file does not exist, this method returns null. All other errors are thrown.
  getFile(path: string): Promise<string | null>
  setFile(path: string, obj: string): Promise<string>
}

export class S3Repository implements FileRepository {
  rootPath = ""

  constructor(
    private readonly s3: S3Client,
    private readonly bucketName: string
  ) {}

  setRootPath(path: string): void {
    this.rootPath = path

    if (!this.rootPath.endsWith("/")) {
      throw new Error("Root path must end with a forward slash")
    }
  }

  async getFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: this.rootPath + key,
    })

    try {
      const response = await this.s3.send(command)
      const body = await response.Body?.transformToString()
      if (!body) {
        throw new Error("Could not transform S3 response body to string")
      }

      return body
    } catch (_error: unknown) {
      const S3Error = z.object({
        name: z.string(),
      })
      const error = S3Error.safeParse(_error)
      if (!error.success) {
        throw _error
      }
      // Check if the error is because the file doesn't exist
      if (error.data.name === "NoSuchKey") {
        return null // Return null if the file doesn't exist
      }

      throw error // Rethrow the error if it's due to another reason
    }
  }
  async setFile(key: string, content: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: this.rootPath + key,
      Body: content,
    })

    await this.s3.send(command)
    return content
  }
}

import { promises as fs } from "fs"

class JsonFileRepository implements FileRepository {
  rootPath = ""

  setRootPath(path: string): void {
    this.rootPath = path
    if (this.rootPath.length && !this.rootPath.endsWith("/")) {
      throw new Error("Root path must end with a forward slash")
    }
  }

  async getFile(path: string): Promise<string | null> {
    const fullPath = this.rootPath + path
    try {
      const content = await fs.readFile(fullPath, "utf-8")
      return content
    } catch (error) {
      const errorParsed = z.object({ code: z.string() }).safeParse(error)
      if (errorParsed.success && errorParsed.data.code === "ENOENT") {
        return null // File does not exist
      }

      throw error // Other errors are thrown
    }
  }

  async setFile(path: string, obj: string): Promise<string> {
    const fullPath = this.rootPath + path
    await fs.writeFile(fullPath, obj, "utf-8")
    return obj // Returning the written content
  }
}

export class StateServiceImpl implements StateService {
  constructor(
    private readonly repository: FileRepository,
    private readonly stateFileName: string
  ) {}

  async getTransactionList(): Promise<Transaction[]> {
    const state = await this.getFullState()
    return state.transactions
  }

  async setTransactionList(transactions: Transaction[]): Promise<Transaction[]> {
    return this._updateProperty("transactions", transactions)
  }

  async getLastProcessedHistoryId(): Promise<string | null> {
    const state = await this.getFullState()
    return state.lastHistoryId
  }

  async setLastProcessedHistoryId(historyId: string | null) {
    return this._updateProperty("lastHistoryId", historyId)
  }

  async getProcessedEmailIds(): Promise<string[]> {
    const state = await this.getFullState()
    return state.processedEmailIds
  }

  async setProcessedEmailIds(emailIds: string[]): Promise<string[]> {
    return this._updateProperty("processedEmailIds", emailIds)
  }

  async getSocketConnectionIds(): Promise<string[]> {
    const state = await this.getFullState()
    return state.socketConnectionIds
  }

  async setSocketConnectionIds(connectionIds: string[]): Promise<string[]> {
    return this._updateProperty("socketConnectionIds", connectionIds)
  }

  // add connection id to the list of socket connection ids
  async addSocketConnectionId(connectionId: string): Promise<string[]> {
    const connectionIds = await this.getSocketConnectionIds()
    connectionIds.push(connectionId)
    return this.setSocketConnectionIds(connectionIds)
  }

  // remove connection id from the list of socket connection ids
  async removeSocketConnectionId(connectionId: string): Promise<string[]> {
    const connectionIds = await this.getSocketConnectionIds()
    const index = connectionIds.indexOf(connectionId)
    if (index > -1) {
      connectionIds.splice(index, 1)
    } else {
      console.error(`Connection ID ${connectionId} not found in the list of socket connection IDs.`)
    }

    return this.setSocketConnectionIds(connectionIds)
  }

  _mapState(state: StoredState): State {
    const mapped = {
      ...state,
      transactions: state.transactions.map((transaction) => ({
        ...transaction,
        datetime: new Date(transaction.datetime),
      })),
      lastHistoryId: state.lastHistoryId,
    }

    return StateSchema.parse(mapped)
  }

  async getFullState(): Promise<State> {
    const rawState = await this.repository.getFile(this.stateFileName)

    if (rawState === null) {
      const startState = {
        transactions: [],
        lastHistoryId: null,
        processedEmailIds: [],
        socketConnectionIds: [],
      }
      this._setFullState(startState)
      return startState
    }

    const state = StoredStateSchema.parse(JSON.parse(rawState))
    return this._mapState(state)
  }

  async _setFullState(state: State): Promise<State> {
    const storedState = {
      ...state,
      transactions: state.transactions.map((transaction) => ({
        ...transaction,
        datetime: transaction.datetime.toISOString(),
      })),
    }

    const json = JSON.stringify(storedState, null, 2)
    await this.repository.setFile(this.stateFileName, json)

    return this.getFullState()
  }

  async _updateProperty<T>(property: keyof State, value: T, fullState?: State): Promise<T> {
    const state = await this.getFullState()

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    state[property] = value as any // Using 'as any' to bypass the potential type mismatch error.

    const result = await this._setFullState(state)

    return result[property] as T
  }
}
