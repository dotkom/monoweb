/** @jsxImportSource theme-ui */

import PortableText from "../../molecules/PortableText";

import { Box } from "@theme-ui/components";
import { FC } from "react";
import { SectionProps } from ".";
import { ThemeUIStyleObject } from "@theme-ui/css";

export const CompanyInfo: FC<SectionProps> = ({ content }) => {
  return <PortableText blocks={content} sx={styles} />;
};

const styles: ThemeUIStyleObject = {
  maxWidth: "768px",
  margin: "auto",
  alignSelf: "center",
  h2: { color: "gray.1", marginTop: 4, fontSize: 24, fontWeight: "bold" },
  p: { marginTop: 3, fontSize: 14 },
};
