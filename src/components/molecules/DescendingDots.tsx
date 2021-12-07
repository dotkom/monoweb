/** @jsxImportSource theme-ui */

import React from "react";
import { Flex, ThemeUIStyleObject } from "theme-ui";

import { Circle } from "../atoms/Circle";

interface DescendingDotsProps {
  size: number;
  circleColor: string;
}

const styles: ThemeUIStyleObject = {
  circle: { flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 20 },
  text: { fontWeight: "bold", fontSize: "26" },
};

export const DescendingDots: React.FC<DescendingDotsProps> = ({ size, circleColor }) => {
  return (
    <Flex sx={{ maxWidth: size, flexDirection: "column", gap: 50, margin: "auto", marginTop: 40, marginBottom: 40 }}>
      <Flex sx={styles.circle}>
        <Circle size={size / 15} color={circleColor}>
          1
        </Circle>
        <text sx={styles.text}>Kartlegging</text>
      </Flex>
      <Flex sx={styles.circle}>
        <Circle size={size / 15} color={circleColor}>
          2
        </Circle>
        <text sx={styles.text}>Intern planlegging</text>
      </Flex>
      <Flex sx={styles.circle}>
        <Circle size={size / 15} color={circleColor}>
          3
        </Circle>
        <text sx={styles.text}>Tilbud</text>
      </Flex>
      <Flex sx={styles.circle}>
        <Circle size={size / 15} color={circleColor}>
          4
        </Circle>
        <text sx={styles.text}>Sammarbeid</text>
      </Flex>
    </Flex>
  );
};

export default DescendingDots;
