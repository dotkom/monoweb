//import PortableText from "react-portable-text";

//import { jsx, Text } from "theme-ui";
//import { Heading, Box, Card } from "@theme-ui/components";
import Box from "@components/particles/Box";
import Text from "@components/atoms/Text";
import Card from "@components/atoms/Card";
import PortableText from "@components/molecules/PortableText";
import { FC } from "react";
import { typography } from "@styles/typography";
import { colors } from "@styles/colors";

interface ArticleTagsProps {
  content: string[];
}

export const ArticleTags: FC<ArticleTagsProps> = (props: ArticleTagsProps) => {
  const content = props.content;

  return (
    <Box
      css={{
        maxWidth: "60rem",
        margin: "auto",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "35rem",
        marginTop: "0.7rem",
      }}
    >
      <Card
        css={{
          backgroundColor: "#DBDDE1",
          color: "#4C566A",
          borderRadius: "5px",
          height: "1.5rem",
          display: "flex",
          alignItems: "center",
          padding: "7px",
          marginRight: "0.5rem",
        }}
      >
        <h6>Mental helse</h6>
      </Card>
      <Card
        sx={{
          backgroundColor: colors.gray[11],
          color: colors.gray[3],
          borderRadius: "5px",
          height: "1.5rem",
          display: "flex",
          alignItems: "center",
          padding: "7px",
          marginRight: "0.5rem",
        }}
      >
        <h6>Shitpost</h6>
      </Card>
      <Card
        sx={{
          backgroundColor: colors.gray[11],
          color: colors.gray[3],
          borderRadius: "5px",
          height: "1.5rem",
          display: "flex",
          alignItems: "center",
          padding: "7px",
        }}
      >
        <h6>Life changing</h6>
      </Card>
    </Box>
  );
};
