import Card from "../atoms/Card";
import { styled } from "@theme";
import Button from "../atoms/Button";
import Text from "../atoms/Text";
import Icon from "../atoms/Icon";

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

interface InterestGroupCardProps {
  backgroundImage?: string;
  icon: string;
  heading: string;
  description: string;
}

const Heading = styled("h4", {
  fontSize: "26px",
  color: "2E3440",
  width: "226px",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "60px",
  marginBottom: "0",
  textAlign: "center",
});

const Banner = styled("div", {
  height: "86px",
  width: "calc(100% + 64px)",
  marginLeft: "-32px",
  marginRight: "-32px",
  marginTop: "-32px",
  borderTopLeftRadius: "$3",
  borderTopRightRadius: "$3",
  backgroundRepeat: "no-repeat",
  backgroundSize: "auto",
});

const TEMPLATE_BACKGROUND_COLORS = ["#5E6779", "#2C5183", "#FBBE6A", "#8FB795"];

const InterestGroupCard: React.FC<InterestGroupCardProps> = ({ backgroundImage, icon, heading, description }) => {
  const randomColor = TEMPLATE_BACKGROUND_COLORS[getRandomInt(TEMPLATE_BACKGROUND_COLORS.length - 1)];

  // if backgroundImage is not provided, use random colored banner
  const background = backgroundImage ? `url(${backgroundImage})` : randomColor;

  console.log(background);
  return (
    <Card shadow css={{ width: "300px", height: "500px", position: "relative" }}>
      {/* Fallback on randomColor if 'background' fails */}
      <Banner css={{ background: `${background}, ${randomColor}` }} />
      <Icon width="100px" height="100px" src={icon} />
      <Heading color="gray">{heading}</Heading>
      <Text color="gray" size="md" css={{ width: "200px", marginRight: "auto", marginLeft: "auto" }}>
        {description}
      </Text>
      <Button css={{ position: "absolute", right: "16px", bottom: "16px" }}>Les mer</Button>
    </Card>
  );
};

export default InterestGroupCard;
