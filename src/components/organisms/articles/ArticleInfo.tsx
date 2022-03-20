import PortableText from "react-portable-text";

import { jsx, Text } from "theme-ui";
import { Heading, Box } from "@theme-ui/components";
import { FC } from "react";
import { typography } from "@styles/typography";
import { colors } from "@styles/colors";

interface ArticleInfoProps {
  content: {
    content: [Record<string, unknown>];
  };
}

export const ArticleInfo: FC<ArticleInfoProps> = (props: ArticleInfoProps) => {
  const content = props.content.content;

  return (
    <Box sx={{ maxWidth: "60rem", margin: "auto", alignSelf: "center", display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: "48px", fontFamily: "'Poppins'", fontWeight: 700, margin: 0, alignSelf: "center" }}>
        Sa noen Makrellgutta?
      </h3>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          maxWidth: "37rem",
        }}
      >
        <Box>
          <div style={{ display: "flex" }}>
            <p style={{ color: colors.gray[2], fontWeight: 600 }}>Skrevet av&nbsp;</p>
            <p style={{ color: colors.gray[2] }}> Magne Slåtsveen</p>
          </div>
          <div style={{ display: "flex" }}>
            <p style={{ color: colors.gray[2], fontWeight: 600, marginTop: 0 }}>Foto av&nbsp;</p>
            <p style={{ color: colors.gray[2], marginTop: 0 }}> Magne Slåtsveen</p>
          </div>
        </Box>

        <Box>
          <div style={{ display: "flex" }}>
            <p style={{ color: colors.gray[2], fontWeight: 600 }}>Publisert&nbsp;</p>
            <p style={{ color: colors.gray[2] }}> 5 August, 2021</p>
          </div>
          <div style={{ display: "flex" }}>
            <p style={{ fontWeight: 600, marginTop: 0 }}>6 minutter&nbsp;</p>
            <p style={{ marginTop: 0 }}>for å lese</p>
          </div>
        </Box>
      </Box>

      {/* <PortableText
        content={content}
        className="companyInfo"
        serializers={{
          h2: (content: [Record<string, unknown>]) => (
            <Heading sx={{ color: "gray.1", marginTop: "8vh", fontSize: 24, fontWeight: "bold" }} {...content} />
          ),
          p: (content: [Record<string, unknown>]) => <p className="underText">{content}</p>,
        }}
      /> */}
    </Box>
  );
};
