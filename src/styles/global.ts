import { Theme } from "theme-ui";

const globalStyles: Theme["styles"] = {
  root: {
    "html, body, #__next": {
      width: "100%",
      minHeight: "100vh",
    },
    "#__next": {
      bg: "#FBFCFD",
    },
    fontFamily: "body",
    lineHeight: "body",
    fontWeight: "body",
  },
  h1: {
    color: "text",
    fontFamily: "heading",
    lineHeight: "heading",
    fontWeight: "heading",
    fontSize: 5,
  },
  h2: {
    color: "text",
    fontFamily: "heading",
    lineHeight: "heading",
    fontWeight: "heading",
    fontSize: 4,
  },
  h3: {
    color: "text",
    fontFamily: "heading",
    lineHeight: "heading",
    fontWeight: "heading",
    fontSize: 3,
  },
  h4: {
    color: "text",
    fontFamily: "heading",
    lineHeight: "heading",
    fontWeight: "heading",
    fontSize: 2,
  },
  h5: {
    color: "text",
    fontFamily: "heading",
    lineHeight: "heading",
    fontWeight: "heading",
    fontSize: 1,
  },
  h6: {
    color: "text",
    fontFamily: "heading",
    lineHeight: "heading",
    fontWeight: "heading",
    fontSize: 0,
  },
  p: {
    color: "text",
    fontFamily: "body",
    fontWeight: "body",
    lineHeight: "body",
  },
  a: {
    color: "primary",
  },
  pre: {
    fontFamily: "monospace",
    overflowX: "auto",
    code: {
      color: "inherit",
    },
  },
  code: {
    fontFamily: "monospace",
    fontSize: "inherit",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    textAlign: "left",
    borderBottomStyle: "solid",
  },
  td: {
    textAlign: "left",
    borderBottomStyle: "solid",
  },
};

export default globalStyles;
