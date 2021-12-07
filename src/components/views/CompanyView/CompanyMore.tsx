/** @jsxImportSource theme-ui */

import { Box } from "@theme-ui/components";
import { ThemeUIStyleObject } from "@theme-ui/css";
import { FC } from "react";
import { SectionProps } from ".";
import PortableText from "../../molecules/PortableText";

export const CompanyMore: FC<SectionProps> = ({ content }) => {
  return <PortableText blocks={content} sx={styles} />;
};

const styles: ThemeUIStyleObject = {
  margin: "auto",
  marginBottom: 6,
  maxWidth: "500px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  alignSelf: "center",
  textAlign: "center",
  padding: 40,
  h3: { fontSize: 18, marginBottom: 4, textAlign: "center", fontWeight: 600 },
  p: { fontSize: 12 },
};
