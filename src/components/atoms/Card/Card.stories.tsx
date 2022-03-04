import Card from "./Card";
import Text from "../Text";

export default {
  title: "atoms/Card",
  component: Card,
};

const Content = () => (
  <>
    <Text as="h1" size="md">
      Word of the Day
    </Text>
    <Text>be•nev•o•lent</Text>
    <Text size="md" color="$gray3">
      adjective
    </Text>
    <Text>well meaning and kindly. "a benevolent smile"</Text>
  </>
);

export const Outline = () => (
  <Card css={{ maxWidth: "250px", padding: "$2" }}>
    <Content />
  </Card>
);

export const Shadow = () => (
  <Card css={{ maxWidth: "250px", padding: "$2" }} shadow>
    <Content />
  </Card>
);
