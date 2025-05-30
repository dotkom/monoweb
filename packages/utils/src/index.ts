import * as DateFns from "date-fns"
import * as DateFnsLocale from "date-fns/locale"

DateFns.setDefaultOptions({ locale: DateFnsLocale.nb })

export * from "./academicYear"
export * from "./slugify"

export { DateFns, DateFnsLocale }
