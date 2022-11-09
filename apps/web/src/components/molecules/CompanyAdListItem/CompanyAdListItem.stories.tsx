import CompanyAdListItem from "./CompanyAdListItem";

export default {
  title: "molecules/CompanyAdListItem",
  component: CompanyAdListItem,
};

export const SingleAd = () => (
  <CompanyAdListItem
    name="Google"
    position="Sommerjobb"
    location={["Oslo"]}
    deadline={new Date(2022, 11, 2)}
    logo="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1280px-Google_2015_logo.svg.png"
  />
);
