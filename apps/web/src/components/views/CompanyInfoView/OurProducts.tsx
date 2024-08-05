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
    name: "Tech Talks",
    icon: TechtalksIcon,
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
    <div className="flex flex-wrap max-w-[600px] justify-evenly items-center">
      {PRODUCTS.map((product) => (
        <div className="flex flex-col px-10 pb-8 justify-center">
          <product.icon className="h-[50px] lg:h-[100px]" fill="#0D5474" stroke="#0D5474"/>
          <Text className="font-bold text-brand">{product.name}</Text>
        </div>
      ))}
    </div>
  </div>
)

export default OurProducts
