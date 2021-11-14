import { Box, ThemeUICSSObject } from "theme-ui";

const style: ThemeUICSSObject = {
  bg: "primary",
  color: "white",
  textAlign: "center",
  borderRadius: "50%",
  display: "inline-flex",
  float: "left",
  flexDirection: "column",
  justifyContent: "center",
};

interface CircleProps {
  size: number;
}

export const Circle: React.FC<CircleProps> = ({ children, size }) => {
  return <Box sx={{ ...style, width: size, height: size, fontSize: size * 0.6 }}>{children}</Box>;
};

export default Circle;
