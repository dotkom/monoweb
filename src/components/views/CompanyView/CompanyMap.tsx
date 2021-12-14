/** @jsxImportSource theme-ui */

import { Box, Flex } from "@theme-ui/components";
import ConnectedCircles from "@components/molecules/ConnectedCircles";
import React, { FC, useEffect, useState } from "react";
import DescendingDots from "@components/molecules/DescendingDots";
import { theme } from "@styles/theme";
import { ThemeUIStyleObject } from "theme-ui";

export const CompanyMap: FC = () => {
  return (
    <Flex sx={styles.wrapper}>
      <Flex sx={styles.container}>
        <Box sx={styles.descendingContainer}>
          <DescendingDots size={700} circleColor={"blue.3"} />
        </Box>
        <Box sx={styles.textWrapper}>
          <Flex sx={styles.horizontalContainer}>
            <ConnectedCircles size={750} circleColor={"blue.3"} lineColor={"black"} />
            <Flex>
              <p sx={styles.p1}>Kartlegging</p>
              <p sx={styles.p2}>Intern planlegging</p>
              <p sx={styles.p3}>Tilbud</p>
              <p sx={styles.p4}>Sammarbeid</p>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

interface StyleSX {
  //Hello Anhkha hope your eyes dont bleed to much :))
  wrapper: ThemeUIStyleObject;
  container: ThemeUIStyleObject;
  descendingContainer: ThemeUIStyleObject;
  textWrapper: ThemeUIStyleObject;
  horizontalContainer: ThemeUIStyleObject;
  p1: ThemeUIStyleObject;
  p2: ThemeUIStyleObject;
  p3: ThemeUIStyleObject;
  p4: ThemeUIStyleObject;
}

const styles: StyleSX = {
  wrapper: { bg: "#EBF3FE", minHeight: 230, marginTop: 60, width: "100%" },
  container: { flexDirection: "column", maxWidth: 768, margin: "auto" },
  descendingContainer: {
    display: ["flex", "flex", "none", "none"],
  },
  textWrapper: {
    display: ["none", "none", "flex", "flex"],
  },
  horizontalContainer: { flexDirection: "column" },
  //hard-coded css
  p1: { marginLeft: 20, fontWeight: "bold" },
  p2: { marginLeft: 80, fontWeight: "bold" },
  p3: { marginLeft: 100, fontWeight: "bold" },
  p4: { marginLeft: 130, fontWeight: "bold" },
};
