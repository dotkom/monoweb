import type { KioskRouter } from "@dotkomonline/rpc"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@dotkomonline/ui"
import type { CurrenciesType } from "../currencyConverter"
import { StockListItem, StockListItemSkeleton } from "./StockListItem"

type StockListProps = {
  products: KioskRouter.GetProductStockOutput
  currency: CurrenciesType
}

const StockTableHeader = () => (
  <TableHeader>
    <TableRow>
      <TableHead className="w-14">Bilde</TableHead>
      <TableHead>Navn</TableHead>
      <TableHead>På lager</TableHead>
      <TableHead>Pris</TableHead>
    </TableRow>
  </TableHeader>
)

export const StockList = ({ products, currency }: StockListProps) => (
  <Table>
    <StockTableHeader />
    <TableBody>
      {products.map((product, i) => (
        <StockListItem key={product.id} product={product} index={i} currency={currency} />
      ))}
    </TableBody>
  </Table>
)

export const StockListSkeleton = () => (
  <Table>
    <StockTableHeader />
    <TableBody>
      <StockListItemSkeleton />
      <StockListItemSkeleton />
      <StockListItemSkeleton />
      <StockListItemSkeleton />
      <StockListItemSkeleton />
      <StockListItemSkeleton />
    </TableBody>
  </Table>
)
