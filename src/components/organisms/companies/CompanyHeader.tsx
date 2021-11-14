import { Text, TextProps, Heading, Box } from "@theme-ui/components";
import React from "react";
import PortableText from "react-portable-text";

export const CompanyHeader = (props) => {
  const content1 = props.content.content;
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
          content={content1}
          className="companyTitle"
          serializers={{
            h1: (content1) => <Heading sx={{ color: "gray.1", fontSize: 36 }} {...content1} />,
            p: ({ children }) => <p className="underText">{children}</p>,
          }}
        ></PortableText>
      </Box>
    </Box>
  );
};
