/** @jsxImportSource theme-ui */

import { Box } from "@theme-ui/components";
import { FC } from "react";
import PortableText from "../../molecules/PortableText";
interface CompanyMoreProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyMore: FC<CompanyMoreProps> = (props: CompanyMoreProps) => {
  const content = props.content.content;
  return (
    <Box
      sx={{
        margin: "auto",
        marginTop: "10vh",
        marginBottom: "10vh",
        maxWidth: "35%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
      }}
    >
      <PortableText
        blocks={content}
        sx={{
          h3: { fontSize: 18, marginBottom: "3vh", textAlign: "center", fontWeight: 600 },
          p: { fontSize: 12 },
        }}
      ></PortableText>
    </Box>
  );
};
