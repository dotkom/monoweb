/** @jsxImportSource theme-ui */

import { Flex } from "@theme-ui/components";
import { FC } from "react";
import { SectionProps } from ".";
import PortableText from "../../molecules/PortableText";

export const CompanyProducts: FC<SectionProps> = ({ content }) => {
  return (
    <Flex
      sx={{
        maxWidth: "500px",
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
            marginBottom: 4,
            marginTop: 4,
            textAlign: "center",
          },
          p: { fontSize: 14 },
        }}
      ></PortableText>
    </Flex>
  );
};
