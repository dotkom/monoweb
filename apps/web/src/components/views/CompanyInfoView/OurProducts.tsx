import BedpressIcon from "@/components/icons/BedpressIcon"
import ItexIcon from "@/components/icons/ItexIcon"
import OfflineIcon from "@/components/icons/OfflineIcon"
import UtlysningIcon from "@/components/icons/UtlysningIcon"
import { Text } from "@dotkomonline/ui"

const PRODUCTS = [
  {
    name: "ITEX",
    icon: ItexIcon,
  },
  {
    name: "Bedriftsarrangement",
    icon: BedpressIcon,
  },
  {
    name: "Stillingsutlysning",
    icon: UtlysningIcon,
  },
  {
    name: "Annonse i Offline",
    icon: OfflineIcon,
  },
] as const

const OurProducts = () => (
  <div className="columns-2 md:flex md:justify-evenly md:gap-20">
    {PRODUCTS.map((product) => (
      <div key={product.name} className="flex flex-col pb-8 items-center text-brand-lighter">
        <product.icon className="h-[50px] lg:h-[100px]" fill="currentColor" stroke="currentColor" />
        <Text className="font-bold text-current">{product.name}</Text>
      </div>
    ))}
  </div>
)

export default OurProducts
