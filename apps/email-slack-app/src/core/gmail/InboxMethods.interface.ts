import type { Message } from "./GmailClient"
import type { Label } from "./Label.interface"
import type { SearchQuery } from "./SearchQuery.interface"

/**
 * If you update this, please also update the docs in Readme.md
 */
export interface GmailClientWrapperI {
  /**
   * Finds messages based on the searchQuery
   * Can be typed or plain text as you can be used to in the gmail search-bar
   */
  findMessages(searchQuery: SearchQuery | string): Promise<Message[]>
  /**
   * Gets all the labels. Default ones and custom ones.
   */
  getAllLabels(): Promise<Label[]>
  /**
   * Gets the latest messages
   */
  getLatestMessages(): Promise<Message[]>
  /**
   * Waits until a message is received.
   * Handy for testing if the 'welcome' or 'verify email' email is being send within a time limit e.g. 60seconds
   */
  waitTillMessage(
    searchQuery: SearchQuery | string,
    shouldLogEvents: boolean,
    timeTillNextCallInSeconds: number,
    maxWaitTimeInSeconds: number
  ): Promise<Message[]>
}
