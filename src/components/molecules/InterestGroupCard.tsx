import Card from "../atoms/Card";
import { styled } from "@theme";
import Button from "../atoms/Button";
import Text from "../atoms/Text";
import Icon from "../atoms/Icon";
import Box from "@components/particles/Box";

interface InterestGroupCardProps {
  backgroundImage: string;
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

const Banner = ({ src }: { src: string }) => (
  <div
    style={{
      height: "86px",
      width: "calc(100% + 64px)",
      marginLeft: "-32px",
      marginRight: "-32px",
      marginTop: "-32px",
      borderTopLeftRadius: "$3",
      borderTopRightRadius: "$3",
      background: `url(${src})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "auto",
    }}
  ></div>
);

const InterestGroupCard: React.FC<InterestGroupCardProps> = ({ backgroundImage, icon, heading, description }) => {
  return (
    <Card shadow css={{ width: "300px", height: "500px", position: "relative" }}>
      <Icon width="100px" height="100px" src={icon} />
      <Banner src={backgroundImage} />
      <Heading color="gray">{heading}</Heading>
      <Text color="gray" size="md" css={{ width: "200px", marginRight: "auto", marginLeft: "auto" }}>
        {description}
      </Text>
      <Button css={{ position: "absolute", right: "16px", bottom: "16px" }}>Les mer</Button>
    </Card>
  );
};

export default InterestGroupCard;
