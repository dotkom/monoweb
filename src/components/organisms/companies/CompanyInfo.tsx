import PortableText from "react-portable-text";

import { Heading, Box } from "@theme-ui/components";
import { FC } from "react";

interface CompanyInfoProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const CompanyInfo: FC<CompanyInfoProps> = (props: CompanyInfoProps) => {
  const content = props.content.content;
  return (
    <Box sx={{ maxWidth: "768px", margin: "auto", alignSelf: "center" }}>
      <PortableText
        content={content}
        className="companyInfo"
        serializers={{
          h2: (content: [Record<string, unknown>]) => (
            <Heading sx={{ color: "gray.1", marginTop: "8vh", fontSize: 24, fontWeight: "bold" }} {...content} />
          ),
          p: (content: [Record<string, unknown>]) => <p className="underText">{content}</p>,
        }}
      />
    </Box>
  );
};
