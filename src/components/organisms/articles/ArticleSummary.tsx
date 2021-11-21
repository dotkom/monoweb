import PortableText from "react-portable-text";

import { jsx, Text } from "theme-ui";
import { Heading, Box, Card } from "@theme-ui/components";
import { FC } from "react";
import { typography } from "@styles/typography";
import { colors } from "@styles/colors";

interface ArticleSummaryProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const ArticleSummary: FC<ArticleSummaryProps> = (props: ArticleSummaryProps) => {
  const content = props.content.content;

  return (
    <Box
      sx={{
        maxWidth: "35rem",
        margin: "auto",
        alignSelf: "center",
        display: "flex",
        flexDirection: "column",
        marginTop: "2.5rem",
      }}
    >
      <Text variant="emphasis">
        Ingen sa det skulle være lett å være komitéleder, men ingen sa det skulle være enda vanskeligere å ha litt
        kontroversielle meninger i tillegg. Det har i det siste versert noen hashtagger i Prokomslacken som hinter til
        at min popularitet har falt som en sten etter ledervalget.
      </Text>
    </Box>
  );
};
