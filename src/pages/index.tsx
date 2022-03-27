import React from "react";
import Button from "@components/atoms/Button/Button";
import { styled } from "@theme";
import Navbar from "@components/organisms/Navbar";
const Home: React.FC = () => {
  return (
    <Box>
      <Button>Hello</Button>
    </Box>
  );
};

const Box = styled("div", {});

export default Home;
