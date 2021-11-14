import { Box, ThemeUICSSObject } from "theme-ui";

const style: ThemeUICSSObject = {
  color: "white",
  textAlign: "center",
  borderRadius: "50%",
  display: "inline-flex",
  float: "left",
  flexDirection: "column",
  justifyContent: "center",
  margin: 0,
};

interface CircleProps {
  size: number;
  color: string;
}

export const Circle: React.FC<CircleProps> = ({ children, size, color }) => {
  return <Box sx={{ ...style, width: size, height: size, fontSize: size * 0.6, bg: color }}>{children}</Box>;
};

export default Circle;
