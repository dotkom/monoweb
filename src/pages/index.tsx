import React from "react";
import { Box, Button } from "theme-ui";

const Home: React.FC = () => {
  return (
    <Box p={4} sx={styles.box}>
      <Button>Hello</Button>
    </Box>
  );
};

const styles = {
  box: {},
};

export default Home;
