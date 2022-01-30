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
  const dynamicSize = size / 10 + "vw";

  return (
    <Box sx={{ ...style, width: dynamicSize, height: dynamicSize, fontSize: size * 0.05 + "vw", bg: color }}>
      {children}
    </Box>
  );
};

export default Circle;
