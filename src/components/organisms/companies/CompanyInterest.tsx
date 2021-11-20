import { FC } from "react";
import PortableText from "react-portable-text";
import { Box, Heading, Text, Button, Flex } from "theme-ui";

interface CompanyInterestProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyInterestForm: FC<CompanyInterestProps> = (props: CompanyInterestProps) => {
  const content = props.content.content;
  return (
    <Box
      sx={{
        width: "90%",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "center",
        marginTop: "5vh",
      }}
    >
      <PortableText
        content={content}
        className="companyInterest"
        serializers={{
          h2: (content: [Record<string, unknown>]) => (
            <Heading
              sx={{ color: "gray.1", fontSize: 32, marginBottom: "3vh", textAlign: "center", fontWeight: 600 }}
              {...content}
            />
          ),
          //this does not work atm -- --
          normal: (children: [Record<string, unknown>]) => (
            <Flex sx={{ width: "100%", justifyContent: "center" }}>
              <Text sx={{ fontSize: "12px", color: "black.1", width: "40%", textAlign: "center" }} {...children} />
            </Flex>
          ),
        }}
      ></PortableText>
      <Button sx={{ marginTop: "5vh" }}>Send Interesse</Button>
    </Box>
  );
};
