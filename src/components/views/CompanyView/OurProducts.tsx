import { VFC } from "react";
import React from "react";
import Circle from "@components/atoms/Circle";
import { css } from "@theme";
import { Box } from "@components/primitives";

const OurProducts = () => {
  return <div className={styles.stepText()}></div>;
};

const styles = {
  stepText: css({
    maxWidth: "$lg",
    padding: "$4 $3",
    mx: "auto",
    "@bp3": {
      display: "flex",
      justifyContent: "space-between",
    },
  }),
  line: css({
    display: "relative",
    transform: "rotate(45deg)",
  }),
};

export default OurProducts;
