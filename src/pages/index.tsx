import React from "react";
import Button from "@components/atoms/Button";
import { styled } from "@stitches/theme";

const Home: React.FC = () => {
  return (
    <Box>
      <Button>Hello</Button>
    </Box>
  );
};

const Box = styled("div", {});

export default Home;
