import PortableText from "react-portable-text";

import { Heading, Box } from "@theme-ui/components";

interface CompanyInfoProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyInfo = (props: CompanyInfoProps) => {
  const content = props.content.content;
  return (
    <Box sx={{ maxWidth: "50%", margin: "auto", alignSelf: "center" }}>
      <PortableText
        content={content}
        className="companyInfo"
        serializers={{
          h2: (content: [Record<string, unknown>]) => (
            <Heading sx={{ color: "gray.1", marginTop: "8vh" }} {...content} />
          ),
          p: (content: [Record<string, unknown>]) => <p className="underText">{content}</p>,
        }}
      />
    </Box>
  );
};
