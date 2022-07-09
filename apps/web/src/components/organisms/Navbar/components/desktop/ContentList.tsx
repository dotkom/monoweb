import { css, styled } from "@theme"

const styles = css({
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
})

const ContentList = styled("ul", styles)

export default ContentList
