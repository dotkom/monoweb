import { Text, TextProps, Heading, Box } from "@theme-ui/components";
import React from "react";
import PortableText from "react-portable-text";

const content = [
  {
    _key: "d634596165d1",
    _type: "block",
    children: [
      { _key: "9fe54971a702", _type: "span", marks: [], text: "Er din bedrift på jakt etter skarpe IT-studenter?" },
    ],
    markDefs: [],
    style: "h1",
  },
  {
    _key: "0baf27ff9c6b",
    _type: "block",
    children: [
      {
        _key: "f0aa340feb8b",
        _type: "span",
        marks: [],
        text: "Online er en linjeforening for Informatikkstudentene ved NTNU Gløshaugen. Informatikkstudiet hører til Institutt for datateknologi og informatikk (IDI). Dette innebærer blant annet å lære om utvikling, forbedring, evaluering og bruk av datasystemer. For mer informasjon om studiet, se NTNU sine offisielle nettsider for bachelor og master.",
      },
    ],
  },
];

export const CompanyHeader = (props) => {
  return (
    <Box
      sx={{
        bg: "orange.12",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "40%", marginBottom: "20px", marginTop: "10vh" }}>
        <PortableText
          content={content}
          className="companyTitle"
          serializers={{
            h1: (content) => <Heading sx={{ color: "gray.1", fontSize: 36 }} {...content} />,
            p: ({ children }) => <p className="underText">{children}</p>,
          }}
        ></PortableText>
      </Box>
    </Box>
  );
};
