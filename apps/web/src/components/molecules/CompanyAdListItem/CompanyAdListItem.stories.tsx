import { DateTime } from "luxon"
import CompanyAdListItem from "./CompanyAdListItem"

export default {
  title: "molecules/CompanyAdListItem",
  component: CompanyAdListItem,
}

const career = {
  title: "tittel",
  company_name: "Google",
  career_type: "Sommerjobb",
  location: "Oslo",
  deadline: "22.11.2022",
  image: {
    asset: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1280px-Google_2015_logo.svg.png",
    },
  },
  link: "123",
  content: "",
  company_info: "hh",
  slug: "sommerjobb-google",
}
export const SingleAd = () => <CompanyAdListItem career={career} />
