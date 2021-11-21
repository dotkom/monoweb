import { Box, Flex, Grid } from "@theme-ui/components";
import ConnectedCircles from "@components/molecules/ConnectedCircles";
import React, { FC } from "react";
//let x = document.body.clientWidth;
export const CompanyMap: FC = () => {
  return (
    <Flex sx={{ bg: "#EBF3FE", minHeight: 230, marginTop: "6vh", width: "100%", justifyContent: "center" }}>
      {/*<Flex sx={{ marginTop: "10vh", flexDirection: "column", width: "60%" }}>
        <Box marginLeft={45}>
          <ConnectedCircles size={x * 0.6} lineColor={"#153E75"} circleColor={"blue.3"} />
        </Box>
        <Grid gap={2} columns={[2, null, 4]}>
          <Box sx={{ fontSize: 24, fontWeight: 600 }}>Kartlegging</Box>
          <Box sx={{ fontSize: 24, fontWeight: 600, width: 240 }}>Intern planlegging</Box>
          <Box marginLeft="8vh" sx={{ fontSize: 24, fontWeight: 600 }}>
            Tilbud
          </Box>
          <Box sx={{ fontSize: 24, fontWeight: 600 }}>Sammarbeid</Box>
        </Grid>
  </Flex>*/}
    </Flex>
  );
};
