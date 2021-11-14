import { Box, Heading, Text } from "@theme-ui/components";
import PortableText from "react-portable-text";

const content = [
  {
    _key: "40548f8cdb4d",
    _type: "block",
    children: [{ _key: "d455effaa690", _type: "span", marks: [], text: "Lyst til å høre mer?" }],
    markDefs: [],
    style: "h3",
  },
  {
    _key: "e8617d62bd32",
    _type: "block",
    children: [
      {
        _key: "ef5c90c51902",
        _type: "span",
        marks: [],
        text: "Onlines bedriftstskomite hjelper deg gjerne med alle spørsmål du måtte ha. E-posten etterstrebes å bli svart på innen to virkedager.\n\nE-post: ",
      },
      { _key: "9bbb1f5a57e8", _type: "span", marks: ["2ccd1c6a8474"], text: "bedriftskontakt@online.ntnu.no" },
      { _key: "b109bfeef36c", _type: "span", marks: [], text: "\n" },
    ],
    markDefs: [{ _key: "2ccd1c6a8474", _type: "link", href: "mailto:bedriftskontakt@online.ntnu.no" }],
    style: "normal",
  },
];
export const CompanyMore = () => {
  return (
    <Box
      sx={{
        marginTop: "10vh",
        marginBottom: "10vh",
        width: "25%",
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
