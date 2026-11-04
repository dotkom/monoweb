import { add, isPast, millisecondsToSeconds, secondsToMilliseconds } from "date-fns"
import type { ProductsReturn, ProductStock, StockReturn } from "./zettle"
import { InternalServerError } from "src/error"

class TTLCache<T> {
  value: T | null = null
  expiry: Date
  ttl: number
  fetchfn: (() => Promise<T>) | undefined = undefined

  constructor({
    ttl,
    fetchfn,
  }: {
    ttl: number
    fetchfn?: () => Promise<T>
  }) {
    this.ttl = ttl
    this.expiry = add(new Date(), { seconds: millisecondsToSeconds(ttl) })
    this.fetchfn = fetchfn
  }

  async fetch() {
    if (this.fetchfn === undefined) {
      throw Error("Fetch cannot be called if fetchfn is not set. Use get and set instead")
    }

    if (!this.value || isPast(this.expiry)) {
      this.expiry = add(new Date(), { seconds: millisecondsToSeconds(this.ttl) })
      this.value = await this.fetchfn()

      return this.value
    }

    return this.value
  }

  get() {
    if (isPast(this.expiry)) {
      return null
    }

    return this.value
  }

  set(value: T) {
    this.value = value
    this.expiry = add(new Date(), { seconds: millisecondsToSeconds(this.ttl) })
  }
}

const fetchAccessToken = async () => {
  const zettleClientId = process.env.ZETTLE_API_CLIENT_ID
  const zettleSecretKey = process.env.ZETTLE_API_SECRET_KEY

  if (zettleClientId === undefined || zettleSecretKey === undefined) {
    // LOG: ("Missing zettle secrets")
    return "" // !"" will evaluate to true, throwing later if getAccessToken fails to fetch
  }

  const grantTypeEncoded = encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")
  const zettleClientIdEncoded = encodeURIComponent(zettleClientId)
  const zettleSecretKeyEncoded = encodeURIComponent(zettleSecretKey)

  const res = await fetch(`https://oauth.zettle.com/token`, {
    method: "POST",
    headers: [["Content-Type", "application/x-www-form-urlencoded"]],
    body: `grant_type=${grantTypeEncoded}&client_id=${zettleClientIdEncoded}&assertion=${zettleSecretKeyEncoded}`,
  })

  if (!res.ok) {
    // Log something I dunno
    return ""
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }

  return data.access_token
}

const getProducts = async (token: string): Promise<ProductsReturn> => {
  const orgId = process.env.ZETTLE_ORG_ID

  const res = await fetch(`https://products.izettle.com/organizations/${orgId}/products`, {
    headers: [["Authorization", `Bearer ${token}`]],
  })

  if (!res.ok) {
    // Log something
    throw new InternalServerError("Product fetch failed")
  }

  const data = await res.json()

  return data
}

const getStock = async (token: string): Promise<StockReturn> => {
  const inventoryId = process.env.ZETTLE_INVENTORY_ID

  const res = await fetch(`https://inventory.izettle.com/v3/stock/${inventoryId}`, {
    headers: [["Authorization", `Bearer ${token}`]],
  })

  if (!res.ok) {
    // Log something
    throw new InternalServerError("Stock fetch failed")
  }

  const data = await res.json()

  return data
}

const stockKey = (productUuid: string, variantUuid: string) => `${productUuid}:${variantUuid}`

export function aggregateProductsWithStock(products: ProductsReturn, stock: StockReturn): ProductStock[] {
  const stockByVariant = new Map(stock.map((entry) => [stockKey(entry.productUuid, entry.variantUuid), entry]))

  return products.map((product) => ({
    id: product.uuid,
    name: product.name,
    category: product.category,
    presentation: product.presentation ?? null,
    price: product.variants[0]?.price ?? null,
    vatPercentage: Number(product.vatPercentage),
    balance: product.variants.reduce(
      (total, variant) => total + Number(stockByVariant.get(stockKey(product.uuid, variant.uuid))?.balance ?? 0),
      0
    ),
  }))
}

export interface ZettleService {
  getProductStock(): Promise<ProductStock[]>
}

export function getZettleService(): ZettleService {
  const tokenCache = new TTLCache<string>({
    ttl: secondsToMilliseconds(7150), // access token expiry is always 7200 seconds
    fetchfn: async () => {
      return fetchAccessToken()
    },
  })

  const productCache = new TTLCache<ProductStock[]>({
    ttl: secondsToMilliseconds(5),
  })

  const getAccessToken = async () => {
    const token = await tokenCache.fetch()

    if (!token) {
      throw new InternalServerError("Failed to fetch access token")
    }

    return token
  }

  return {
    getProductStock: async () => {
      let productList = productCache.get()

      if (!productList) {
        const token = await getAccessToken()
        const products = await getProducts(token)
        const stock = await getStock(token)

        productList = aggregateProductsWithStock(products, stock)
        productCache.set(productList)
      }

      return productList
    },
  }
}
