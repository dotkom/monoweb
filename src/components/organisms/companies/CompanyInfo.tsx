import PortableText from "react-portable-text";

import { Heading, Box } from "@theme-ui/components";

export const CompanyInfo = (props) => {
  const content = props.content.content;
  return (
    <Box sx={{ maxWidth: "50%", margin: "auto", alignSelf: "center" }}>
      <PortableText
        content={content}
        className="companyInfo"
        serializers={{
          h2: (content) => <Heading sx={{ color: "gray.1", marginTop: "8vh" }} {...content} />,
          p: ({ content }) => <p className="underText">{content}</p>,
        }}
      />
    </Box>
  );
};
