import { Box, Heading, Text } from "@theme-ui/components";
import PortableText from "react-portable-text";

export const CompanyMore = (props) => {
  const content = props.content.content;
  return (
    <Box
      sx={{
        margin: "auto",
        marginTop: "10vh",
        marginBottom: "10vh",
        maxWidth: "25%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
      }}
    >
      <PortableText
        content={content}
        className="companyMore"
        serializers={{
          h3: (content) => <Heading sx={{ fontSize: 18, marginBottom: "3vh", textAlign: "center" }} {...content} />,
          //this does not work atm -- --
          normal: (children) => <Text sx={{ fontSize: 12 }} {...children} />,
        }}
      ></PortableText>
    </Box>
  );
};
