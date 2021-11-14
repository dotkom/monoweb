import { Text, TextProps, Heading, Box } from "@theme-ui/components";
import React from "react";
import PortableText from "react-portable-text";

interface CompanyHeaderProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyHeader = (props: CompanyHeaderProps) => {
  const content = props.content.content;
  console.log(props.content.content);
  return (
    <Box
      sx={{
        bg: "orange.12",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ maxWidth: "60%", margin: "auto", marginBottom: "20px", marginTop: "10vh" }}>
        <PortableText
          content={content}
          className="companyTitle"
          serializers={{
            h1: (content: [Record<string, unknown>]) => (
              <Heading sx={{ color: "gray.1", fontSize: 36, fontWeight: "bold" }} {...content} />
            ),
            p: (content: [Record<string, unknown>]) => <p className="underText">{content}</p>,
          }}
        ></PortableText>
      </Box>
    </Box>
  );
};
