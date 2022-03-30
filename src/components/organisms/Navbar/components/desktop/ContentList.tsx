import { styled } from "@stitches/react";

const ContentList = styled("ul", {
  display: "grid",
  padding: 22,
  margin: 0,
  columnGap: 10,
  listStyle: "none",

  variants: {
    layout: {
      one: {
        "@media only screen and (min-width: 600px)": {
          width: 500,
          gridTemplateColumns: "0.75fr 1fr",
        },
      },
      two: {
        "@media only screen and (min-width: 600px)": {
          width: 600,
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(4, 1fr)",
        },
      },
      three: {
        width: 400,
        display: "flex",
        flexDirection: "column",
      },
    },
  },
});

export default ContentList;
