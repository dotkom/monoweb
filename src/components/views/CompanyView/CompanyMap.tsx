/** @jsxImportSource theme-ui */

import { Box, Flex, Paragraph } from "@theme-ui/components";
import ConnectedCircles from "@components/molecules/ConnectedCircles";
import React, { FC } from "react";
import DescendingDots from "@components/molecules/DescendingDots";
import { ThemeUIStyleObject } from "theme-ui";
import Circle from "@components/atoms/Circle";

export const CompanyMap: FC = () => {
  const steps = ["Kartlegging", "Intern planlegging", "Tilbud", "Sammarbeid"];
  const size = 700;
  const circleColor = "blue.3";
  return (
    <Flex sx={styles.wrapper}>
      <Flex sx={styles.container}>
        <Box sx={styles.descendingContainer}>
          <Flex
            sx={{ maxWidth: size, flexDirection: "column", gap: 50, margin: "auto", marginTop: 40, marginBottom: 40 }}
          >
            {steps.map((stepsText, index) => {
              return (
                <Flex sx={styles.circle}>
                  <Circle size={size / 15} color={circleColor}>
                    {index + 1}
                  </Circle>
                  <text sx={styles.text}>{stepsText}</text>
                </Flex>
              );
            })}
          </Flex>
        </Box>
        <Box sx={styles.textWrapper}>
          <Flex sx={styles.horizontalContainer}>
            <ConnectedCircles size={750} circleColor={"blue.3"} lineColor={"black"} />
            <Flex>
              <Paragraph sx={styles.p1}>Kartlegging</Paragraph>
              <Paragraph sx={styles.p2}>Intern planlegging</Paragraph>
              <Paragraph sx={styles.p3}>Tilbud</Paragraph>
              <Paragraph sx={styles.p4}>Sammarbeid</Paragraph>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

interface StyleSX {
  wrapper: ThemeUIStyleObject;
  container: ThemeUIStyleObject;
  descendingContainer: ThemeUIStyleObject;
  textWrapper: ThemeUIStyleObject;
  horizontalContainer: ThemeUIStyleObject;
  text: ThemeUIStyleObject;
  circle: ThemeUIStyleObject;
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
  circle: { flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 20 },
  text: { fontWeight: "bold", fontSize: "26" },

  p1: { marginLeft: 20, fontWeight: "bold" },
  p2: { marginLeft: 80, fontWeight: "bold" },
  p3: { marginLeft: 100, fontWeight: "bold" },
  p4: { marginLeft: 130, fontWeight: "bold" },
};
