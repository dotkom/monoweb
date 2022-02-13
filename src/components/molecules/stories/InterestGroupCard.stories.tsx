import InterestGroupCard from "../InterestGroupCard";
import Text from "../../atoms/Text";

export default {
  title: "atoms/InterestGroupCard",
  component: InterestGroupCard,
};

const Content = () => (
  <>
    <Text color="gray">Word of the Day</Text>
    <p>be•nev•o•lent</p>
    <Text color="gray">adjective</Text>
    <p>well meaning and kindly. "a benevolent smile"</p>
  </>
);

export const RectangleCard = () => (
  <InterestGroupCard css={{ maxWidth: "250px" }} >
    <Content />
  </InterestGroupCard>
);


export const SquareCard = () => (
  <InterestGroupCard css={{ maxWidth: "250px" }}>
    <Content />
  </InterestGroupCard>
);