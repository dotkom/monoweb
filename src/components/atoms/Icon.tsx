import { styled } from "@theme";

interface IconProps {
  src: string;
  height: string;
  width: string;
}

const IconStyle = styled("div", {
  borderRadius: "50%",
  position: "absolute",
  // this value does not match the figma sketch
  top: "40px",
  marginLeft: "auto",
  marginRight: "auto",
  left: "0px",
  right: "0px",
  textAlign: "center",
});

const extractValue = (val: string): number => {
  return Number(val.replace(/\D/g, ""));
};

const Icon: React.FC<IconProps> = ({ src, height, width }) => {
  return (
    <IconStyle
      css={{
        width,
        height,
        background: "#D9EFE3",
        display: "grid",
        placeItems: "center",
      }}
    >
      <img
        src={src}
        alt="test"
        style={{
          // filter: "invert(20%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)",
          width: `${extractValue(width) * 0.88}px`,
          height: `${extractValue(height) * 0.88}px`,
        }}
      />
    </IconStyle>
  );
};

export default Icon;
