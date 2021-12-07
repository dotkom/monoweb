/** @jsxImportSource theme-ui */

import { Box, Flex } from "@theme-ui/components";
import ConnectedCircles from "@components/molecules/ConnectedCircles";
import React, { FC, useEffect, useState } from "react";
import DescendingDots from "@components/molecules/DescendingDots";
import { theme } from "@styles/theme";

interface windowProps {
  width: number;
  height: number;
}

//let x = document.body.clientWidth;
export const CompanyMap: FC = () => {
  return (
    <Flex sx={{ bg: "#EBF3FE", minHeight: 230, marginTop: 60, width: "100%" }}>
      <Flex sx={{ flexDirection: "column", maxWidth: 768, margin: "auto" }}>
        <Box sx={{ display: ["flex", "none"] }}>
          <DescendingDots size={700} circleColor={"blue.3"} />
        </Box>
        <Box sx={{ display: ["none", "flex"] }}>
          <Flex sx={{ flexDirection: "column" }}>
            <ConnectedCircles size={650} circleColor={"blue.3"} lineColor={"black"} />
            <Flex sx={{ flexDirection: "row" }}>
              <p sx={{ fontWeight: "bold" }}>Kartlegging</p>
              <p sx={{ marginLeft: 75, fontWeight: "bold" }}>Intern planlegging</p>
              <p sx={{ marginLeft: 70, fontWeight: "bold" }}>Tilbud</p>
              <p sx={{ marginLeft: 100, fontWeight: "bold" }}>Sammarbeid</p>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
