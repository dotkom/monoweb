/** @jsxImportSource theme-ui */
import { FC } from "react";
import PortableText from "../../molecules/PortableText";

import { Flex, Button, ThemeUIStyleObject } from "theme-ui";
import { SectionProps } from ".";

export const CompanyInterestForm: FC<SectionProps> = ({ content }) => {
  return (
    <Flex sx={styles.flex}>
      <PortableText blocks={content} sx={styles.portableText} />
      <Button sx={styles.button}>Send Interesse</Button>
    </Flex>
  );
};

interface StyleSX {
  button: ThemeUIStyleObject | undefined;
  portableText: ThemeUIStyleObject | undefined;
  flex: ThemeUIStyleObject | undefined;
}

const styles: StyleSX = {
  button: {
    marginTop: 4,
    width: "220px",
    height: "56px",
  },
  portableText: {
    h2: { color: "gray.1", fontSize: 32, marginBottom: 4, textAlign: "center", fontWeight: 600 },
    p: {
      maxWidth: "400px",
      fontSize: "12px",
      color: "black.1",
      textAlign: "center",
      margin: "auto",
    },
  },
  flex: {
    width: "90%",
    margin: "auto",
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 4,
  },
};
