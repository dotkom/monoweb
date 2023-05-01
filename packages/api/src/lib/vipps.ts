import axios, { AxiosInstance, AxiosResponse } from "axios"

import { AsyncEvent } from "../utils/promise-utils"
import { randomUUID } from "crypto"

const VIPPS_API_BASE_URL = process.env.NODE_ENV === "production" ? "https://api.vipps.no" : "https://apitest.vipps.no"

interface VippsGetAccessTokenData {
  token_type: string
  expires_in: number
  ext_expires_in: number
  expires_on: number
  not_before: number
  resource: string
  access_token: string
}

export interface VippsWebRedirectPaymentData {
  redirectUrl: string
  reference: string
}

export interface VippsAmountData {
  currency: string
  value: number
}

export interface VippsCapturePaymentData {
  state: "CREATED"
  amount: VippsAmountData
  aggregate: {
    authorizedAmount: VippsAmountData
    cancelledAmount: VippsAmountData
    capturedAmount: VippsAmountData
    refundedAmount: VippsAmountData
  }
  pspReference: string
  reference: string
}

export interface VippsRefundPaymentData extends VippsCapturePaymentData {}

export interface Vipps {
  createWebRedirectPayment(
    currency: string,
    amount: number,
    type: "WALLET",
    reference: string,
    description?: string,
    returnUrl?: string,
    phoneNumber?: string
  ): Promise<VippsWebRedirectPaymentData>
  capturePayment(reference: string, currency: string, amount: number): Promise<VippsCapturePaymentData>
  refundPayment(reference: string, currency: string, amount: number): Promise<VippsRefundPaymentData>
}

export class VippsImpl implements Vipps {
  private readonly axiosInstance: AxiosInstance
  private readonly accessTokenEvent = new AsyncEvent()
  private refreshTimeout: NodeJS.Timeout | null = null
  private accessToken: string | null = null
  private expiresIn: number | null = null

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly merchantSubscriptionKey: string,
    private readonly merchantSerialNumber: string // private readonly msidsn: string
  ) {
    this.axiosInstance = axios.create({
      baseURL: VIPPS_API_BASE_URL,
      headers: {
        "Ocp-Apim-Subscription-Key": this.merchantSubscriptionKey,
        "Merchant-Serial-Number": this.merchantSerialNumber,
      },
    })

    this.requestAccessToken()
  }

  async requestAccessToken(): Promise<VippsGetAccessTokenData> {
    this.accessTokenEvent.reset()

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }

    const resp = await this.axiosInstance.post<VippsGetAccessTokenData>(
      "/accessToken/get",
      {},
      {
        headers: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
      }
    )

    if (resp.status >= 400) {
      throw new Error(`Failed to request access token: ${resp.data}`)
    }

    this.accessToken = resp.data.access_token
    this.expiresIn = resp.data.expires_in

    this.scheduleAccessTokenRefresh()
    this.accessTokenEvent.set()

    return resp.data
  }

  scheduleAccessTokenRefresh() {
    if (!this.accessToken || !this.expiresIn) {
      throw new Error("Cannot schedule access token refresh without access token")
    }

    const milliseconds = (this.expiresIn - 5 * 60) * 1000

    this.refreshTimeout = setTimeout(() => {
      this.refreshTimeout = null
      this.requestAccessToken()
    }, milliseconds)
  }

  async authorizedRequest<T>(
    method: "GET" | "POST",
    path: string,
    data?: any,
    idempotencyKey?: string
  ): Promise<AxiosResponse<T>> {
    await this.accessTokenEvent.wait() // Wait for access token to be set / refreshed

    if (!idempotencyKey) {
      idempotencyKey = randomUUID()
    }

    const resp = await this.axiosInstance.request<T>({
      method,
      url: path,
      data,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Idempotency-Key": idempotencyKey,
      },
    })

    if (resp.status === 401) {
      await this.requestAccessToken()
      return this.authorizedRequest(method, path, data, idempotencyKey)
    }

    return resp
  }

  async createWebRedirectPayment(
    currency: string,
    amount: number,
    type: "WALLET",
    reference: string,
    description?: string,
    returnUrl?: string,
    phoneNumber?: string
  ): Promise<VippsWebRedirectPaymentData> {
    const data: any = {
      amount: {
        currency,
        value: amount,
      },
      paymentMethod: {
        type,
      },
      reference,
      userFlow: "WEB_REDIRECT",
    }

    if (description) {
      data.paymentDescription = description
    }
    if (returnUrl) {
      data.returnUrl = returnUrl
    }
    if (phoneNumber) {
      data.customer = {
        phoneNumber,
      }
    }

    const resp = await this.authorizedRequest<VippsWebRedirectPaymentData>("POST", "/epayment/v1/payments", data)
    return resp.data
  }

  async capturePayment(reference: string, currency: string, amount: number): Promise<VippsCapturePaymentData> {
    const resp = await this.authorizedRequest<VippsCapturePaymentData>(
      "POST",
      `/epayment/v1/payments/${reference}/capture`,
      {
        modificationAmount: {
          currency: currency,
          value: amount,
        },
      }
    )

    return resp.data
  }

  async refundPayment(reference: string, currency: string, amount: number): Promise<VippsRefundPaymentData> {
    const resp = await this.authorizedRequest<VippsRefundPaymentData>(
      "POST",
      `/epayment/v1/payments/${reference}/refund`,
      {
        modificationAmount: {
          currency: currency,
          value: amount,
        },
      }
    )

    return resp.data
  }
}

interface VippsAccountDetails {
  clientId: string
  clientSecret: string
  merchantSubscriptionKey: string
  merchantSerialNumber: string
  webhookSecret: string
}

const vippsAccountsMap = new Map<string, VippsAccountDetails>()

vippsAccountsMap.set("onlineVipps", {
  clientId: process.env.ONLINE_VIPPS_CLIENT_ID!,
  clientSecret: process.env.ONLINE_VIPPS_CLIENT_SECRET!,
  merchantSubscriptionKey: process.env.ONLINE_VIPPS_MERCHANT_SUBSCRIPTION_KEY!,
  merchantSerialNumber: process.env.ONLINE_VIPPS_MERCHANT_SERIAL_NUMBER!,
  webhookSecret: process.env.ONLINE_VIPPS_WEBHOOK_SECRET!,
})

const lookupMap = new Map<string, VippsAccountDetails>(
  Array.from(vippsAccountsMap.values()).map((a) => [a.clientId, a])
)

export const vippsClientIds = Array.from(vippsAccountsMap.keys())
export const readableVippsAccounts = Array.from(vippsAccountsMap.entries()).map(([k, v]) => ({
  alias: k,
  clientId: v.clientId,
}))

const vippsObjectMap = new Map<string, Vipps>()

export function getVippsObject(clientId: string): Vipps | undefined {
  const accountDetails = lookupMap.get(clientId)
  if (!accountDetails) {
    return
  }

  let vipps = vippsObjectMap.get(clientId)
  if (!vipps) {
    vipps = new VippsImpl(
      accountDetails.clientId,
      accountDetails.clientSecret,
      accountDetails.merchantSubscriptionKey,
      accountDetails.merchantSerialNumber
    )
    vippsObjectMap.set(clientId, vipps)
  }

  return vipps
}

export function getVippsWebhookSecret(clientId: string): string | undefined {
  const accountDetails = lookupMap.get(clientId)
  return accountDetails?.webhookSecret
}
