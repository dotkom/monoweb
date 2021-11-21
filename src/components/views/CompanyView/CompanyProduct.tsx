/** @jsxImportSource theme-ui */

import { Box } from "@theme-ui/components";
import { FC } from "react";
import PortableText from "../../molecules/PortableText";
interface CompanyProductsProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyProducts: FC<CompanyProductsProps> = (props: CompanyProductsProps) => {
  const content = props.content.content;
  return (
    <Box
      sx={{
        maxWidth: "500px",
        display: "flex",
        flexDirection: "column",
        alignSelf: "center",
        alignItems: "center",
        margin: "auto",
      }}
    >
      <PortableText
        blocks={content}
        sx={{
          h2: {
            color: "gray.1",
            fontSize: 32,
            fontWeight: "bold",
            marginBottom: "3vh",
            marginTop: "10vh ",
            textAlign: "center",
          },
          p: { fontSize: 14 },
        }}
      ></PortableText>
    </Box>
  );
};
