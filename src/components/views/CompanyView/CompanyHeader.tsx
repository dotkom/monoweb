/** @jsxImportSource theme-ui */
import { Box, Flex } from "@theme-ui/components";
import { FC } from "react";
import { SectionProps } from ".";
import PortableText from "../../molecules/PortableText";

export const CompanyHeader: FC<SectionProps> = ({ content }) => {
  return (
    <Flex
      sx={{
        bg: "orange.12",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        margin: "auto",
      }}
    >
      <Box sx={{ maxWidth: "1024px", margin: "auto", marginBottom: "20px", marginTop: 5 }}>
        <PortableText
          blocks={content}
          sx={{
            maxWidth: "768px",
            width: "100%",
            margin: "auto",
            padding: 4,
            h1: { color: "gray.1", marginBottom: 4, fontSize: 36 },
            normal: { fontSize: 14 },
          }}
        />
      </Box>
    </Flex>
  );
};
