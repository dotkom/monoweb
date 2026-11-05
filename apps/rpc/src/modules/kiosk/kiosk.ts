import { z } from "zod"

export const StockReturnSchema = z.array(
  z.object({
    organizationUuid: z.string(),
    inventoryUuid: z.string(),
    productUuid: z.string(),
    variantUuid: z.string(),
    updated: z.string(),
    // The inventory API returns balance and lowStockLevel as strings.
    balance: z.coerce.number().int(),
    lowStockLevel: z.coerce.number().int().nullable(),
    lowStockAlert: z.boolean(),
    checksum: z.string(),
  })
)
export type StockReturn = z.infer<typeof StockReturnSchema>

const PresentationSchema = z.object({
  imageUrl: z.string(),
  backgroundColor: z.string().nullable(),
  textColor: z.string().nullable(),
})

const MoneySchema = z.object({
  amount: z.number().int(),
  currencyId: z.string(),
})

export const ProductsReturnSchema = z.array(
  z.object({
    uuid: z.string(),
    categories: z.array(z.string()),
    name: z.string(),
    description: z.string().nullable(),
    imageLookupKeys: z.array(z.string()),
    presentation: PresentationSchema.nullable().optional(),
    variants: z.array(
      z.object({
        uuid: z.string(),
        name: z.string().nullable(),
        description: z.string().nullable(),
        sku: z.string().nullable(),
        barcode: z.string().nullable(),
        price: MoneySchema,
        costPrice: MoneySchema.nullable(),
        // The product API returns vatPercentage as a string.
        vatPercentage: z.coerce.number(),
        options: z
          .array(
            z.object({
              name: z.string(),
              value: z.string(),
            })
          )
          .nullable(),
        presentation: PresentationSchema.nullable(),
      })
    ),
    externalReference: z.string().nullable(),
    etag: z.string(),
    updated: z.string(),
    updatedBy: z.string(),
    created: z.string(),
    unitName: z.string().nullable(),
    vatPercentage: z.coerce.number(),
    online: z
      .object({
        status: z.string(),
        title: z.string(),
        description: z.string(),
        shipping: z.object({
          shippingPricingModel: z.string(),
          weightInGrams: z.number().int(),
          weight: z.object({
            weight: z.number(),
            unit: z.string(),
          }),
        }),
        presentation: z.object({
          displayImageUrl: z.string(),
          additionalImageUrls: z.array(z.string()),
          mediaUrls: z.array(z.string()),
        }),
        seo: z.object({
          title: z.string(),
          metaDescription: z.string(),
          slug: z.string(),
        }),
      })
      .nullable(),
    variantOptionDefinitions: z
      .object({
        definitions: z.array(
          z.object({
            name: z.string(),
            properties: z.array(
              z.object({
                value: z.string(),
                imageUrl: z.string(),
              })
            ),
          })
        ),
      })
      .nullable(),
    taxCode: z.string().nullable(),
    category: z.object({
      uuid: z.string(),
      name: z.string(),
    }),
    metadata: z
      .object({
        inPos: z.boolean(),
        source: z.object({
          name: z.string(),
          external: z.boolean(),
        }),
      })
      .nullable(),
    taxRates: z.array(z.string()),
    taxExempt: z.boolean().nullable(),
  })
)
export type ProductsReturn = z.infer<typeof ProductsReturnSchema>

export const ProductStockSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.object({
    uuid: z.string(),
    name: z.string(),
  }),
  presentation: PresentationSchema.nullable(),
  price: MoneySchema.nullable(),
  vatPercentage: z.number(),
  balance: z.number().int(),
})
export type ProductStock = z.infer<typeof ProductStockSchema>
