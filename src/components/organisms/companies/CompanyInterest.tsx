import PortableText from "react-portable-text";
import { Box, Heading, Text, Button, Flex } from "theme-ui";

export const CompanyInterestForm = (props) => {
  const content = props.content.content;
  return (
    <Box
      sx={{
        width: "60%",
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
          h2: (content) => (
            <Heading
              sx={{ color: "gray.1", fontSize: 32, marginBottom: "3vh", textAlign: "center", fontWeight: 600 }}
              {...content}
            />
          ),
          //this does not work atm -- --
          normal: ({ children }) => (
            <Flex sx={{ width: "100%", justifyContent: "center" }}>
              <Text sx={{ fontSize: "12px", color: "black.1", width: "40%", textAlign: "center" }}>{children}</Text>
            </Flex>
          ),
        }}
      ></PortableText>
      <Button sx={{ marginTop: "5vh" }}>Send Interesse</Button>
    </Box>
  );
};
