import BedpressIcon from "@/components/icons/BedpressIcon"
import ItexIcon from "@/components/icons/ItexIcon"
import OfflineIcon from "@/components/icons/OfflineIcon"
import TechtalksIcon from "@/components/icons/TechtalksIcon"
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
  <div className="flex flex-col justify-center">
    <div className="flex justify-evenly items-center">
      {PRODUCTS.map((product) => (
        <div key={product.name} className="flex flex-col px-10 pb-8 justify-center text-brand-lighter">
          <product.icon className="h-[50px] lg:h-[100px]" fill="currentColor" stroke="currentColor" />
          <Text className="font-bold text-current">{product.name}</Text>
        </div>
      ))}
    </div>
  </div>
)

export default OurProducts
