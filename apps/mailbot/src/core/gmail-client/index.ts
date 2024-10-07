import type { gmail_v1 } from "@googleapis/gmail";
import { GoogleMailParser } from "./GmailParser";

interface Label {
  color?: {
    backgroundColor?: string | null;
    textColor?: string | null;
  };
  id: string;
  labelListVisibility?: string | null;
  messageListVisibility?: string | null;
  messagesTotal?: number | null;
  messagesUnread?: number | null;
  name: string;
  threadsTotal?: number | null;
  threadsUnread?: number | null;
  type?: string | null;
}

export interface Message {
  messageId: string;
  threadId: string;
  subject: string | undefined;
  from: string | undefined;
  to: string | undefined;
  receivedOn: string | undefined;
  labelIds: string[];
  snippet: string;
  historyId: string;
  /**
   * unix ms timestamp string
   */
  internalDate: string;
  getFullMessage: () => any;
  body: {
    html: string | undefined;
    text: string | undefined;
  };
}

export type MessageIsType =
  | "read"
  | "unread"
  | "snoozed"
  | "starred"
  | "important";

export interface MessageDateType {
  date: Date;
  precision?: "year" | "day" | "milliseconds";
}

export type UnixTimestamp = number; // this alias for number gives you a better autocomplete suggestion

export interface SearchQuery {
  /**
   * Search for one or multiple potential subjects
   */
  subject?: string | string[];
  message?: string;
  mustContainText?: string | string[];
  from?: string | string[];
  to?: string | string[];
  cc?: string;
  bcc?: string;
  /**
   * In which label the message should be
   */
  labels?: string[];
  has?:
    | "attachment"
    | "drive"
    | "document"
    | "spreadsheet"
    | "youtube"
    | "presentation";
  /**
   * Some possible extensions to search with, if not use "filename" property with your extension. e.g. filename: "png"
   * Note: The filenames containing the extension will also be returned. E.g. 'filenameExtension:"pdf" will also return 'not-a-pdf.jpg'
   */
  filenameExtension?: "pdf" | "ppt" | "doc" | "docx" | "zip" | "rar";
  /**
   * you can search like filename: "pdf" or filename:"salary.pdf"
   */
  filename?: string;
  /**
   * What status the message is in
   */
  is?: MessageIsType | MessageIsType[];

  /**
   * same as 'newer'
   */
  after?: MessageDateType | UnixTimestamp;
  /**
   * same as 'older'
   */
  before?: MessageDateType | UnixTimestamp;

  /**
   * same as 'before'
   */
  older?: MessageDateType | UnixTimestamp;
  /**
   * same as 'after'
   */
  newer?: MessageDateType | UnixTimestamp;

  olderThan?: {
    /**
     * Must be higher than 0
     */
    amount: number;
    period: "day" | "month" | "year";
  };
  newerThan?: {
    /**
     * Must be higher than 0
     */
    amount: number;
    period: "day" | "month" | "year";
  };

  maxResults?: number;

  category?:
    | "primary"
    | "social"
    | "promotions"
    | "updates"
    | "forums"
    | "reservations"
    | "purchases";
  // sizeInBytes?: number,
  // largerThanInBytes?: number,
  // smallerThanInBytes?: number,
}

export interface GmailClient {
  /**
   * Finds messages based on the searchQuery
   * Can be typed or plain text as you can be used to in the gmail search-bar
   */
  findMessages(searchQuery: SearchQuery | string): Promise<Message[]>;
  /**
   * Gets a label by name
   */
  getLabel(labelName: string): Promise<Label | null>;
  /**
   * Gets all the labels. Default ones and custom ones.
   */
  getAllLabels(): Promise<Label[]>;
}

export class GmailClient implements GmailClient {
  constructor(private readonly gmailClient: gmail_v1.Gmail) {}

  public async removeLabel(messageId: string, labelId: string): Promise<void> {
    await this.gmailClient.users.messages.modify({
      requestBody: {
        removeLabelIds: [labelId],
      },
      userId: "me",
      id: messageId,
    });
  }

  public async getLabel(labelName: string): Promise<Label | null> {
    const labels = await this.getAllLabels();
    return labels.find((label) => label.name === labelName) || null;
  }

  public async getAllLabels(): Promise<Label[]> {
    return new Promise((resolve, reject) => {
      this.gmailClient.users.labels.list(
        {
          userId: "me",
        },
        (errorMessage, result) => {
          if (errorMessage) {
            reject(errorMessage);
            return;
          }

          resolve(result?.data.labels as Label[]);
        }
      );
    });
  }

  /**
   * Finds existing emails
   *
   * Example search query
   * - "has:attachment filename:salary.pdf largerThan:1000000 label:(paychecks salaries) from:myoldcompany@oldcompany.com"
   * - {
   *   has: "attachment",
   *   filename: "salary.pdf",
   *   largerThanInBytes: 1000000,
   *   labels: ["paychecks", "salaries"],
   *   from: "myoldcompany@oldcompany.com"
   * }
   */
  public findMessages(
    searchQuery: SearchQuery | string | undefined
  ): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      let searchString: string | undefined;
      if (typeof searchQuery === "string" || searchQuery === undefined) {
        searchString = searchQuery;
      } else {
        searchString = this.mapSearchQueryToSearchString(searchQuery);
      }

      const query: any = {
        userId: "me",
      };

      if (searchString) {
        query.q = searchString;
      }

      if (typeof searchQuery === "object" && searchQuery.maxResults) {
        query.maxResults = searchQuery.maxResults;
      }

      this.gmailClient.users.messages.list(
        query,
        async (errorMessage: any, result: any) => {
          if (errorMessage) {
            reject(errorMessage);
            return;
          }

          const gmailMessages: gmail_v1.Schema$Message[] | undefined =
            result?.data.messages;
          if (!gmailMessages) {
            return resolve([]);
          }

          const messages: gmail_v1.Schema$Message[] = await Promise.all(
            gmailMessages.map(
              async (message: gmail_v1.Schema$Message): Promise<any> => {
                if (message.id) {
                  return this.getMessageById(message.id);
                }
                return null;
              }
            )
          );

          messages.filter((message) => !!message === true);

          resolve(messages as any);
        }
      );
    });
  }

  private async getMessageById(messageId: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      this.gmailClient.users.messages.get(
        {
          format: "full",
          id: messageId,
          userId: "me",
        },
        (errorMessage, message) => {
          if (errorMessage) {
            reject(errorMessage);
          } else {
            resolve(GoogleMailParser.formatMessage(message as any) as Message);
          }
        }
      );
    });
  }

  private arrayToAdvancedSearchString(itemOrItems: string[] | string) {
    if (typeof itemOrItems === "string") {
      return itemOrItems;
    }

    return `(${itemOrItems.join(" ")})`;
  }

  private mapSearchQueryToSearchString(searchQuery: SearchQuery): string {
    let searchString = "";

    if (searchQuery.message) {
      searchString += searchQuery.message;
    }

    if (searchQuery.subject) {
      searchString += `subject: ${this.arrayToAdvancedSearchString(
        searchQuery.subject
      )} `;
    }

    if (searchQuery.mustContainText) {
      searchString += `"${searchQuery.mustContainText}" `;
    }

    if (searchQuery.from) {
      searchString += `from: ${this.arrayToAdvancedSearchString(
        searchQuery.from
      )} `;
    }

    if (searchQuery.to) {
      searchString += `to: ${this.arrayToAdvancedSearchString(
        searchQuery.to
      )} `;
    }

    if (searchQuery.cc) {
      searchString += `cc: ${searchQuery.cc} `;
    }

    if (searchQuery.bcc) {
      searchString += `bcc: ${searchQuery.bcc} `;
    }

    if (searchQuery.labels) {
      searchString += `label: ${this.arrayToAdvancedSearchString(
        searchQuery.labels
      )} `;
    }

    if (searchQuery.has) {
      searchString += `has:${searchQuery.has} `;
    }

    if (searchQuery.filenameExtension) {
      searchString += `filename:${searchQuery.filenameExtension} `;
    }

    if (searchQuery.filename) {
      searchString += `filename:${searchQuery.filename} `;
    }

    if (searchQuery.is) {
      searchString += `is: ${searchQuery.is} `;
    }

    if (searchQuery.olderThan && searchQuery.olderThan.amount > 0) {
      const range = searchQuery.olderThan;
      searchString += `older_than:${range.amount}${range.period.slice(0, 1)} `;
    }

    if (searchQuery.newerThan && searchQuery.newerThan.amount > 0) {
      const range = searchQuery.newerThan;
      searchString += `newer_than:${range.amount}${range.period.slice(0, 1)} `;
    }

    if (searchQuery.category) {
      searchString += `category:${searchQuery.category} `;
    }

    if (searchQuery.before) {
      searchString += `before:${this.mapDateTypeToQuery(searchQuery.before)} `;
    }

    if (searchQuery.after) {
      searchString += `after:${this.mapDateTypeToQuery(searchQuery.after)} `;
    }

    if (searchQuery.newer) {
      searchString += `newer:${this.mapDateTypeToQuery(searchQuery.newer)} `;
    }

    if (searchQuery.older) {
      searchString += `older:${this.mapDateTypeToQuery(searchQuery.older)} `;
    }

    return searchString;
  }

  private mapDateTypeToQuery(
    dateType: MessageDateType | UnixTimestamp
  ): number | string {
    if (typeof dateType === "number") {
      return dateType;
    }

    const date = dateType.date;

    switch (dateType.precision) {
      case undefined:
      case null:
      case "milliseconds":
        return Math.floor(date.getTime() / 1000);

      case "day":
        return this.formatDate(date);

      case "year":
        return date.getFullYear();
    }
  }

  private formatDate(date: Date) {
    let month = `${date.getMonth() + 1}`;
    let day = `${date.getDate()}`;
    const year = date.getFullYear();

    if (month.length < 2) {
      month = `0${month}`;
    }
    if (day.length < 2) {
      day = `0${day}`;
    }

    return [year, month, day].join("/");
  }
}

