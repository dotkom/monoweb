import type { KioskRouter } from "@dotkomonline/rpc"
import { TableCell, TableRow } from "@dotkomonline/ui"
import Image from "next/image"
import { type CurrenciesType, convertCurrency } from "../currencyConverter"
import { useCurrentKWHPrice } from "../queries"

export type ProductStock = KioskRouter.GetProductStockOutput[number]

type StockListItemProps = {
  product: ProductStock
  index: number
  currency: CurrenciesType
}

const animalsLyrics =
  "Baby, I'm preying on you tonight Hunt you down eat you alive Just like animals Animals Like animals-mals Maybe you think that you can hide I can smell your scent for miles Just like animals Animals Like animals-mals Baby I'm So what you trying to do to me It's like we can't stop, we're enemies But we get along when I'm inside you, eh You're like a drug that's killing me I cut you out entirely But I get so high when I'm inside you Yeah, you can start over you can run free You can find other fish in the sea You can pretend it's meant to be But you can't stay away from me I can still hear you making that sound Taking me down rolling on the ground You can pretend that it was me But no, oh Baby, I'm preying on you tonight Hunt you down eat you alive Just like animals Animals Like animals Maybe you think that you can hide I can smell your scent for miles Just like animals Animals Like animals-mals Baby, I'm So if I run it's not enough You're still in my head forever stuck So you can do what you wanna do, eh I love your lies I'll eat 'em up But don't deny the animal That comes alive when I'm inside you Yeah, you can start over you can run free You can find other fish in the sea You can pretend it's meant to be But you can't stay away from me I can still hear you making that sound Taking me down rolling on the ground You can pretend that it was me But no, oh Baby I'm preying on you tonight Hunt you down eat you alive Just like animals Animals Like animals-mals Maybe you think that you can hide I can smell your scent for miles Just like animals Animals Like animals-mals Baby, I'm Don't tell no lie, lie, lie, lie You can't deny-ny-ny-ny The beast inside-side-side-side Yeah yeah yeah No girl, don't lie, lie, lie, lie (no girl don't lie) You can't deny, ny-ny-ny (you can't deny) The beast inside-side-side-side Yeah, yeah, yeah Yo Whoa Whoa Just like animals Animals Like animals-mals Just like animals (yeah) Animals (yeah) Like animals-mals (yeah) Ow Baby I'm preying on you tonight Hunt you down eat you alive Just like animals Animals Like animals-mals Maybe you think that you can hide I can smell your scent for miles Just like animals Animals Like animals-mals Baby I'm Don't tell no lie, lie, lie, lie You can't deny-ny-ny-ny The beast inside-side-side-side Yeah yeah yeah No girl, don't lie, lie, lie, lie (no, girl don't lie) You can't deny-ny-ny-ny (you can't deny) The beast inside-side-side-side Yeah, yeah, yeah".split(
    " "
  )

export const StockListItem = ({ product, index, currency }: StockListItemProps) => {
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
            : convertCurrency(currency, product.price.amount / 100, kwhPrice)
                .replace(".", ",")
                .replace("animals", animalsLyrics[index])}
      </TableCell>
    </TableRow>
  )
}
