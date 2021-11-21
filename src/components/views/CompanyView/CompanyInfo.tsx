/** @jsxImportSource theme-ui */

import PortableText from "../../molecules/PortableText";

import { Box } from "@theme-ui/components";
import { FC } from "react";
import { SectionProps } from ".";

export const CompanyInfo: FC<SectionProps> = ({ content }) => {
  return (
    <Box sx={{ maxWidth: "768px", margin: "auto", alignSelf: "center" }}>
      <PortableText
        blocks={content}
        sx={{
          h2: { color: "gray.1", marginTop: "8vh", fontSize: 24, fontWeight: "bold" },
          p: { marginTop: "2vh", fontSize: 14 },
        }}
      />
    </Box>
  );
};
