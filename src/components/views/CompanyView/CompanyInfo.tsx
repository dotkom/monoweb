/** @jsxImportSource theme-ui */

import PortableText from "../../molecules/PortableText";

import { Box } from "@theme-ui/components";
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
        blocks={content}
        sx={{
          h2: { color: "gray.1", marginTop: "8vh", fontSize: 24, fontWeight: "bold" },
          p: { marginTop: "2vh", fontSize: 14 },
        }}
      />
    </Box>
  );
};

/*className="companyInfo"
        serializers={{
          h2: (content: [Record<string, unknown>]) => (
            <Heading sx={{ color: "gray.1", marginTop: "8vh", fontSize: 24, fontWeight: "bold" }} {...content} />
          ),
          p: (content: [Record<string, unknown>]) => <p className="underText">{content}</p>,
        }}*/
