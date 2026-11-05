import type { KioskRouter } from "@dotkomonline/rpc"
import { TableCell, TableRow } from "@dotkomonline/ui"
import Image from "next/image"
import { type CurrenciesType, convertCurrency } from "../currencyConverter"
import { useCurrentKWHPrice } from "../queries"

export type ProductStock = KioskRouter.GetProductStockOutput[number]

type StockListItemProps = {
  product: ProductStock
  currency: CurrenciesType
}

export const StockListItem = ({ product, currency }: StockListItemProps) => {
  const { kwhPrice } = useCurrentKWHPrice()
  const isSoldOut = product.balance === 0

  return (
    <TableRow>
      <TableCell>
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-100 dark:bg-stone-900">
          {product.presentation ? (
            <Image
              src={product.presentation.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              sizes="48px"
            />
          ) : null}
        </div>
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell className={isSoldOut ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-stone-300"}>
        {currency === "67" ? "67" : isSoldOut ? "Utsolgt" : `${product.balance} stk`}
      </TableCell>
      <TableCell>
        {product.price === null
          ? "Ukjent pris"
          : kwhPrice === undefined
            ? "Laster inn pris ..."
            : convertCurrency(currency, product.price.amount / 100, kwhPrice).replace(".", ",")}
      </TableCell>
    </TableRow>
  )
}
