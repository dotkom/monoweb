import BedpressIcon from "@/components/icons/BedpressIcon";
import ItexIcon from "@/components/icons/ItexIcon";
import OfflineIcon from "@/components/icons/OfflineIcon";
import TechtalksIcon from "@/components/icons/TechtalksIcon";
import UtlysningIcon from "@/components/icons/UtlysningIcon";
import { Text } from "@dotkomonline/ui";

const PRODUCTS = [
  {
    icon: ItexIcon,
    name: "ITEX",
  },
  {
    icon: BedpressIcon,
    name: "Bedriftsarrangement",
  },
  {
    icon: TechtalksIcon,
    name: "Tech Talks",
  },
  {
    icon: UtlysningIcon,
    name: "Stillingsutlysning",
  },
  {
    icon: OfflineIcon,
    name: "Annonse i Offline",
  },
] as const;

const OurProducts = () => (
  <div className="flex flex-col justify-center">
    <div className="flex justify-evenly">
      {PRODUCTS.map((product) => (
        <div className="flex flex-col text-center" key={product.name}>
          <div className="flex justify-center">
            <product.icon className="h-[50px] w-[50px] md:h-12 md:w-[75px] lg:h-[100px] lg:w-[100px]" />
          </div>
          <Text className="font-bold">{product.name}</Text>
        </div>
      ))}
    </div>
  </div>
);

export default OurProducts;
