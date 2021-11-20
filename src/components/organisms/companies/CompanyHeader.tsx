import { Heading, Box } from "@theme-ui/components";
import React, { FC } from "react";
import PortableText from "react-portable-text";

interface CompanyHeaderProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyHeader: FC<CompanyHeaderProps> = (props: CompanyHeaderProps) => {
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
        margin: "auto",
      }}
    >
      <Box sx={{ maxWidth: "1024px", margin: "auto", marginBottom: "20px", marginTop: "10vh" }}>
        <Box sx={{ maxWidth: "768px", width: "100%", margin: "auto", padding: 4 }}>
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
    </Box>
  );
};
