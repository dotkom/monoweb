import { Text, Heading, Box } from "@theme-ui/components";
import React from "react";
import PortableText from "react-portable-text";

interface CompanyProductsProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyProducts = (props: CompanyProductsProps) => {
  const content = props.content.content;
  return (
    <Box
      sx={{
        maxWidth: "40%",
        display: "flex",
        flexDirection: "column",
        alignSelf: "center",
        alignItems: "center",
        margin: "auto",
      }}
    >
      <PortableText
        content={content}
        className="companyInterest"
        serializers={{
          h2: (content: [Record<string, unknown>]) => (
            <Heading
              sx={{
                color: "gray.1",
                fontSize: 32,
                fontWeight: "bold",
                marginBottom: "3vh",
                marginTop: "4vh ",
                textAlign: "center",
              }}
              {...content}
            />
          ),
          //this does not work atm -- --
          normal: (content: [Record<string, unknown>]) => <Text sx={{ fontSize: "14px" }} {...content} />,
        }}
      ></PortableText>
    </Box>
  );
};
