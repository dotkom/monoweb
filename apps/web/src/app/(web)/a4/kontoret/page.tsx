import { cookies } from "next/headers"
import { KontoretPage } from "./components/KontoretPage"
import { CURRENCY_COOKIE_NAME, parseCurrencyCookie } from "./currencyCookie"

const Kontoret = async () => {
  const cookieStore = await cookies()
  const initialCurrency = parseCurrencyCookie(cookieStore.get(CURRENCY_COOKIE_NAME)?.value)

  return <KontoretPage initialCurrency={initialCurrency} />
}

export default Kontoret
