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
    <div className="flex justify-evenly">
      {PRODUCTS.map((product) => (
        <div key={product.name} className="flex flex-col text-center">
          <div className="flex justify-center">
            <product.icon className="h-[50px] w-[50px] md:h-12 md:w-[75px] lg:h-[100px] lg:w-[100px]" />
          </div>
          <Text className="font-bold">{product.name}</Text>
        </div>
      ))}
    </div>
  </div>
)

export default OurProducts
