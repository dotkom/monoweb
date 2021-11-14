import { Box, Heading, Text } from "@theme-ui/components";
import PortableText from "react-portable-text";

interface CompanyMoreProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyMore = (props: CompanyMoreProps) => {
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
          h3: (content: [Record<string, unknown>]) => (
            <Heading sx={{ fontSize: 18, marginBottom: "3vh", textAlign: "center", fontWeight: 600 }} {...content} />
          ),
          //this does not work atm -- --
          normal: (content: [Record<string, unknown>]) => <Text sx={{ fontSize: 12 }} {...content} />,
        }}
      ></PortableText>
    </Box>
  );
};
