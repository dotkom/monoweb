import Card from "../atoms/Card";
import { styled } from "@theme";
import Button from "../atoms/Button";
import Text from "../atoms/Text";
import Icon from "../atoms/Icon";

interface InterestGroupCardProps {
  backgroundImage: string;
  icon: string;
  heading: string;
  description: string;
}

const Heading = styled("h4", {
  fontSize: "26px",
  color: "2E3440",
  width: "293px",
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

const SquareInterestGroupCard: React.FC<InterestGroupCardProps> = ({ backgroundImage, icon, heading, description }) => {
  return (
    <Card shadow css={{ width: "350px", minHeight: "400px", position: "relative" }}>
      <Banner css={{ background: `url(${backgroundImage})` }} />
      <Icon width="100px" height="100px" src={icon} />
      <Heading color="gray">{heading}</Heading>
      <Text color="gray" size="md" css={{ width: "293px", marginRight: "auto", marginLeft: "auto" }}>
        {description}
      </Text>
      <Button css={{ margin: "0 auto", display: "block" }}>Les mer</Button>
    </Card>
  );
};

export default SquareInterestGroupCard;
