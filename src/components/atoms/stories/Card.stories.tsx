import { Card, Paragraph } from "theme-ui";

export default {
  title: "atoms/Card",
  component: Card,
};

export const Basic = () => (
  <Card sx={{ maxWidth: "250px" }}>
    <Paragraph color="gray.3" sx={{ fontSize: "14px" }}>
      Word of the Day
    </Paragraph>
    <Paragraph>be•nev•o•lent</Paragraph>
    <Paragraph color="gray.3">adjective</Paragraph>
    <Paragraph>well meaning and kindly. "a benevolent smile"</Paragraph>
  </Card>
);

export const Outlined = () => (
  <Card variant="outlined" sx={{ maxWidth: "250px" }}>
    <Paragraph color="gray.3" sx={{ fontSize: "14px" }}>
      Word of the Day
    </Paragraph>
    <Paragraph>be•nev•o•lent</Paragraph>
    <Paragraph color="gray.3">adjective</Paragraph>
    <Paragraph>well meaning and kindly. "a benevolent smile"</Paragraph>
  </Card>
);
