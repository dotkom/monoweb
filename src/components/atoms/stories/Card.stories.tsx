import Card from "../Card";
import Text from "../Text";

export default {
  title: "atoms/Card",
  component: Card,
};

const Content = () => (
  <>
    <Text color="gray">Word of the Day</Text>
    <p>be•nev•o•lent</p>
    <Text color="gray">adjective</Text>
    <p>well meaning and kindly. "a benevolent smile"</p>
  </>
);

export const Outline = () => (
  <Card css={{ maxWidth: "250px" }}>
    <Content />
  </Card>
);

export const Shadow = () => (
  <Card css={{ maxWidth: "250px" }} shadow>
    <Content />
  </Card>
);
