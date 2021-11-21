/** @jsxImportSource theme-ui */
import { Box } from "@theme-ui/components";
import { FC } from "react";
import { SectionProps } from ".";
import PortableText from "../../molecules/PortableText";

export const CompanyHeader: FC<SectionProps> = ({ content }) => {
  return (
    <Box
      sx={{
        bg: "orange.12",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "auto",
      }}
    >
      <Box sx={{ maxWidth: "1024px", margin: "auto", marginBottom: "20px", marginTop: "10vh" }}>
        <Box sx={{ maxWidth: "768px", width: "100%", margin: "auto", padding: 4 }}>
          <PortableText
            blocks={content}
            sx={{ h1: { color: "gray.1", marginBottom: "3vh", fontSize: 36 }, normal: { fontSize: 14 } }}
          ></PortableText>
        </Box>
      </Box>
    </Box>
  );
};
