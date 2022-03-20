import React from "react";
import Button from "@components/atoms/Button/Button";
import { styled } from "@theme";
import Fullbar from "@components/organisms/Navbar/Fullbar";
const Home: React.FC = () => {
  return (
    <Box>
      <Button>Hello</Button>
    </Box>
  );
};

const Box = styled("div", {});

export default Home;
